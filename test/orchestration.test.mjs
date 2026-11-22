import assert from 'node:assert/strict'
import { copyFileSync, existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { test } from 'node:test'
import { checkOpenPrs, prove } from '../src/core/check.mjs'
import { parseRule } from '../src/core/rules.mjs'
import { ROOT, commit, hook, makeHome, makeRepo, notwice, tempDir, write } from './helpers.mjs'

const RULE_DIRS = [join(ROOT, 'examples', 'rules'), join(ROOT, 'test', 'fixtures', 'opt-in')]
const ruleFile = (id) => RULE_DIRS.map((dir) => join(dir, `${id}.md`)).find(existsSync)
const GOOD_BODY = '## Problem\nP\n\n## Approach\nA\n\n## Scope\nIn:\n- x\nOut:\n- y\n\n## Tests\n- t\n\n## Screenshots\n'
const CREATE = `gh pr create --title "Add a" --body "${GOOD_BODY}"`
const optInRule = (id) => parseRule(readFileSync(ruleFile(id), 'utf8'), `${id}.md`)
const denied = (r) => r.output?.hookSpecificOutput?.permissionDecision === 'deny'
const reasonOf = (r) => r.output?.hookSpecificOutput?.permissionDecisionReason ?? ''

function homeWith(...ids) {
  const home = makeHome()
  for (const id of ids) copyFileSync(ruleFile(id), join(home, 'proposed', `${id}.md`))
  notwice(['approve', ...ids], { home })
  notwice(['retire', 'tests-after-code'], { home })
  return home
}

function fakeGh(prs = []) {
  const file = join(tempDir(), 'gh.json')
  writeFileSync(file, JSON.stringify({ calls: [], prs }))
  return { FAKE_GH_STATE: file }
}

const openPrs = (count, state = 'OPEN') => Array.from({ length: count }, (_, i) => ({ number: 100 + i, title: 'T', body: 'B', state }))
const bash = (home, cwd, command, extra = {}, env) =>
  hook({ hook_event_name: 'PreToolUse', tool_name: 'Bash', cwd, ...extra, tool_input: { command, ...extra.tool_input } }, { home, env })
const sessionStart = (home, cwd, env) => hook({ hook_event_name: 'SessionStart', source: 'startup', cwd }, { home, env })
const SUBAGENT = { agent_id: 'a1b2c3d4e5f60001', agent_type: 'general-purpose' }

function editCode({ home, repo }, file, extra = {}) {
  const content = `export const v = ${Date.now()}\n`
  const tool_input = { file_path: write(repo, file, content), content }
  return hook({ hook_event_name: 'PostToolUse', tool_name: 'Write', cwd: repo, tool_input, tool_response: { type: 'create', structuredPatch: [] }, ...extra }, { home })
}

const agentDone = ({ home, repo }, input, response) =>
  hook({ hook_event_name: 'PostToolUse', tool_name: 'Agent', cwd: repo, tool_use_id: `use-${response.agentId}`, tool_input: input, tool_response: response }, { home })

test('parsing accepts in: main only on forbid rules for files or commands, and at: pr only on verify rules', () => {
  const rule = (frontmatter) => parseRule(`---\n${frontmatter}\n---\nText.\n`, 'r.md')
  assert.equal(rule("kind: forbid\nin: main\ntargets: [commands]\npattern: 'x'").main, true)
  assert.equal(rule("kind: forbid\npattern: 'x'").main, false)
  assert.throws(() => rule("kind: forbid\nin: subagents\npattern: 'x'"), /in: main is the only scope/)
  assert.throws(() => rule("kind: forbid\nin: main\ntargets: [commits]\npattern: 'x'"), /in: main is the only scope/)
  assert.throws(() => rule("kind: verify\nin: main\nwhen: ['*.ts']\nrun: 'x'"), /in: main is the only scope/)
  assert.throws(() => rule("kind: forbid\nat: pr\npattern: 'x'"), /at: pr is the only gate/)
  assert.throws(() => rule("kind: verify\nat: push\nwhen: ['*.ts']\nrun: 'x'"), /at: pr is the only gate/)
})

test('a CI watch is denied in the main session and allowed in subagents, background commands and child sessions', () => {
  const home = makeHome()
  const repo = makeRepo()
  const watch = bash(home, repo, 'gh pr checks 12 --watch')
  assert.ok(denied(watch))
  assert.match(reasonOf(watch), /\[wait-in-background\] Wait for CI in a background agent/)
  assert.ok(denied(bash(home, repo, 'git push && gh run watch 77')))
  assert.ok(!denied(bash(home, repo, 'gh pr checks 12')))
  assert.ok(!denied(bash(home, repo, 'gh pr checks 12 --watch', SUBAGENT)))
  assert.ok(!denied(bash(home, repo, 'gh pr checks 12 --watch', { tool_input: { run_in_background: true } })))
  assert.ok(!denied(bash(home, repo, 'gh pr checks 12 --watch', {}, { T3CODE_THREAD_ID: 'thread:delegated-task:x' })))
  assert.ok(!denied(bash(home, repo, 'gh pr checks 12 --watch', {}, { NOTWICE_SESSION: 'parent-session' })))
  assert.ok(denied(bash(home, repo, 'gh pr checks 12 --watch', {}, { T3CODE_THREAD_ID: '6f1c9a2e-top-level', NOTWICE_SESSION: 's1' })))
})

test('an in: main files rule denies main-session edits before they land and never fires in subagents, after edits or at Stop', () => {
  const home = homeWith('main-code-edits')
  const repo = makeRepo()
  sessionStart(home, repo)
  const before = (file, extra = {}) =>
    hook({ hook_event_name: 'PreToolUse', tool_name: 'Write', cwd: repo, tool_input: { file_path: join(repo, file), content: 'export const a = 1\n' }, ...extra }, { home })
  assert.ok(denied(before('src/a.ts')))
  assert.match(reasonOf(before('src/a.ts')), /src\/a\.ts:1 \[main-code-edits\]/)
  assert.equal(before('notes.md').output, null)
  hook({ hook_event_name: 'SubagentStart', cwd: repo, ...SUBAGENT }, { home })
  assert.equal(before('src/a.ts', SUBAGENT).output, null)
  assert.equal(editCode({ home, repo }, 'src/a.ts', SUBAGENT).output, null)
  assert.equal(hook({ hook_event_name: 'Stop', cwd: repo, stop_hook_active: false }, { home }).output, null)
})

test('SessionStart exports NOTWICE_SESSION so Bash commands and child sessions can name their parent', () => {
  const envFile = join(tempDir(), 'sessionstart-hook-0.sh')
  hook({ hook_event_name: 'SessionStart', source: 'startup', cwd: makeRepo(), session_id: '1f0e9d8c-7b6a' }, { env: { CLAUDE_ENV_FILE: envFile } })
  assert.equal(readFileSync(envFile, 'utf8'), 'export NOTWICE_SESSION=1f0e9d8c-7b6a\n')
})

test('every subagent gets the rule list at start, without the main-session rules', () => {
  const home = makeHome()
  const repo = makeRepo()
  const start = hook({ hook_event_name: 'SubagentStart', cwd: repo, ...SUBAGENT }, { home }).output.hookSpecificOutput
  assert.equal(start.hookEventName, 'SubagentStart')
  assert.match(start.additionalContext, /no-em-dash: Never use em dashes/)
  assert.doesNotMatch(start.additionalContext, /wait-in-background/)
  assert.match(sessionStart(home, repo).output.hookSpecificOutput.additionalContext, /wait-in-background/)
  assert.equal(hook({ hook_event_name: 'SubagentStart', cwd: repo, agent_id: 'internal', agent_type: '' }, { home }).output, null)
})

test('a review subagent counts once it finishes, even in the background, and only after the last code edit', () => {
  const session = { home: homeWith('review-before-pr'), repo: makeRepo() }
  const { home, repo } = session
  sessionStart(home, repo)
  const gh = fakeGh()
  const create = (command = CREATE) => bash(home, repo, command, {}, gh)
  editCode(session, 'src/a.ts')
  commit(repo, {}, 'Add a')
  assert.ok(denied(create()))
  assert.match(reasonOf(create()), /\[review-before-pr\][\s\S]*src\/a\.ts changed and no check passed after that\. Wait for one to finish after your last edit, for example: Agent\(general-purpose\): Review cart diff\./)
  agentDone(session, { description: 'Review the diff', prompt: 'Review', run_in_background: true }, { status: 'async_launched', agentId: 'review-bg' })
  assert.ok(denied(create()))
  hook({ hook_event_name: 'SubagentStop', cwd: repo, agent_id: 'review-bg', agent_type: 'general-purpose' }, { home })
  assert.ok(!denied(create()))
  editCode(session, 'src/a.ts')
  assert.ok(denied(create()))
  agentDone(session, { description: 'Review the fix', subagent_type: 'fork' }, { status: 'completed', agentId: 'review-fork' })
  assert.ok(denied(create()))
  assert.ok(!denied(create(CREATE.replace('## Problem', 'notwice-allow review-before-pr\n## Problem'))))
  agentDone(session, { description: 'Review the fix', subagent_type: 'general-purpose' }, { status: 'completed', agentId: 'review-fg' })
  assert.ok(!denied(create()))
  editCode(session, 'src/a.ts')
  assert.equal(hook({ hook_event_name: 'Stop', cwd: repo, stop_hook_active: false }, { home }).output, null)
  assert.ok(!JSON.parse(readFileSync(gh.FAKE_GH_STATE, 'utf8')).calls.some((call) => call[1] === 'list'))
})

test('a T3 delegated review counts by its role and title, and the review rule proves itself', () => {
  const session = { home: homeWith('review-before-pr'), repo: makeRepo() }
  sessionStart(session.home, session.repo)
  editCode(session, 'src/a.ts')
  hook({ hook_event_name: 'PostToolUse', tool_name: 'mcp__t3-code__delegate_task', cwd: session.repo, tool_input: { role: 'review', title: 'Review the diff', task: 'x' }, tool_response: [] }, { home: session.home })
  assert.ok(!denied(bash(session.home, session.repo, CREATE, {}, fakeGh())))
  assert.deepEqual(prove(optInRule('review-before-pr')), [])
})

test('the open-PR limit denies gh pr create at the max and fails open without gh or offline', () => {
  const home = homeWith('max-open-prs')
  const repo = makeRepo()
  sessionStart(home, repo)
  const create = (env) => bash(home, repo, CREATE, {}, env)
  const full = create(fakeGh(openPrs(5)))
  assert.ok(denied(full))
  assert.match(reasonOf(full), /repo \[max-open-prs\][\s\S]*5 open PRs \(limit 5\): #100 #101 #102 #103 #104/)
  assert.ok(!denied(create(fakeGh(openPrs(4)))))
  assert.ok(!denied(create(fakeGh([...openPrs(6, 'CLOSED'), ...openPrs(1)]))))
  assert.ok(!denied(create({ ...fakeGh(openPrs(5)), FAKE_GH_OFFLINE: '1' })))
  assert.ok(!denied(create({ ...fakeGh(openPrs(5)), PATH: '/usr/bin:/bin' })))
  const rule = optInRule('max-open-prs')
  assert.deepEqual(prove(rule), [])
  assert.equal(checkOpenPrs([rule], [1, 2, 3, 4]).violations.length, 0)
  assert.equal(checkOpenPrs([rule], [1, 2, 3, 4, 5]).violations.length, 1)
})

test('the opt-in rules the docs name ship in examples/rules and prove', () => {
  const rulesDoc = readFileSync(join(ROOT, 'docs', 'rules.md'), 'utf8')
  const examples = readdirSync(join(ROOT, 'examples', 'rules')).map((name) => name.replace(/\.md$/, ''))
  assert.deepEqual(examples.sort(), ['max-open-prs', 'no-print-p8', 'orchestrator-delegates', 'review-before-pr'])
  for (const id of examples) {
    assert.ok(rulesDoc.includes(`examples/rules/${id}.md`), id)
    assert.deepEqual(prove(optInRule(id)), [], id)
  }
})
