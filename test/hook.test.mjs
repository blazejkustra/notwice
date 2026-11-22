import assert from 'node:assert/strict'
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { test } from 'node:test'
import { EM_DASH, PRIVATE_KEY_LINE, approveExample, commit, gitIn, hook, makeHome, makeRepo, notwice, tempDir, write, writePatch } from './helpers.mjs'

const home = makeHome()
const logOf = (h) => readFileSync(join(h, 'log.jsonl'), 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l))
const ATTRIBUTION = 'Co-Authored-By: Claude <noreply@anthropic.com>'
const GOOD_BODY = '## Problem\nP\n\n## Approach\nA\n\n## Scope\nIn:\n- x\nOut:\n- y\n\n## Tests\n- t\n\n## Screenshots\n'

function postWrite(cwd, file, content, h = home) {
  const before = existsSync(join(cwd, file)) ? readFileSync(join(cwd, file), 'utf8') : null
  const path = write(cwd, file, content)
  const tool_response = { type: before == null ? 'create' : 'update', filePath: path, content, structuredPatch: writePatch(before, content) }
  return hook({ hook_event_name: 'PostToolUse', tool_name: 'Write', cwd, tool_input: { file_path: path, content }, tool_response }, { home: h })
}
const sessionStart = (cwd, h = home) => hook({ hook_event_name: 'SessionStart', source: 'startup', cwd }, { home: h })
const preBash = (cwd, command, env) => hook({ hook_event_name: 'PreToolUse', tool_name: 'Bash', cwd, tool_input: { command } }, { home, env })
const postBash = (cwd, command, env) =>
  hook({ hook_event_name: 'PostToolUse', tool_name: 'Bash', cwd, tool_input: { command }, tool_response: { stdout: '', stderr: '' } }, { home, env })
const stop = (cwd, extra = {}, h = home) => hook({ hook_event_name: 'Stop', cwd, stop_hook_active: false, ...extra }, { home: h })
const denied = (r) => r.output?.hookSpecificOutput?.permissionDecision === 'deny'
const fakeGh = (prs = []) => {
  const file = join(tempDir(), 'gh.json')
  writeFileSync(file, JSON.stringify({ calls: [], prs }))
  return { FAKE_GH_STATE: file }
}

test('SessionStart lists active rules for Claude and tells the user about waiting proposals', () => {
  const repo = makeRepo()
  const r = hook({ hook_event_name: 'SessionStart', source: 'startup', cwd: repo }, { home })
  const context = r.output.hookSpecificOutput.additionalContext
  assert.match(context, /no-em-dash: Never use em dashes/)
  assert.match(context, /human-approval/)
  assert.equal(r.output.systemMessage, undefined)
  const waiting = makeHome({ approve: false })
  const w = hook({ hook_event_name: 'SessionStart', source: 'startup', cwd: repo }, { home: waiting })
  assert.match(w.output.systemMessage, new RegExp(`${readdirSync(join(waiting, 'proposed')).length} proposed rule`))
})

test('an edit that adds an em dash is blocked with the file and line', () => {
  const repo = makeRepo()
  const r = postWrite(repo, 'copy.md', `# Title\nFast setup ${EM_DASH} no config\n`)
  assert.equal(r.code, 0)
  assert.equal(r.output.decision, 'block')
  assert.match(r.output.reason, /copy\.md:2 \[no-em-dash\]/)
  assert.equal(postWrite(repo, 'copy.md', '# Title\nFast setup, no config\n').output, null)
})

test('old content never blocks: only lines added on the branch count', () => {
  const repo = makeRepo()
  gitIn(repo, 'checkout', '-q', 'main')
  commit(repo, { 'legacy.md': `old ${EM_DASH} line\n` }, 'legacy')
  gitIn(repo, 'push', '-q')
  gitIn(repo, 'checkout', '-q', 'feature')
  gitIn(repo, 'merge', '-q', 'main')
  assert.equal(postWrite(repo, 'legacy.md', `old ${EM_DASH} line\nnew line\n`).output, null)
})

test('warn rules reach Claude as context without blocking', () => {
  const repo = makeRepo()
  const r = postWrite(repo, 'src/a.ts', 'void (async () => { await go() })()\n')
  assert.equal(r.output.decision, undefined)
  assert.match(r.output.hookSpecificOutput.additionalContext, /no-async-iife/)
})

test('edits outside a git repo are skipped', () => {
  const dir = tempDir()
  const r = hook({
    hook_event_name: 'PostToolUse', tool_name: 'Edit', cwd: dir,
    tool_input: { file_path: write(dir, 'notes.md', `b ${EM_DASH} c\n`), old_string: 'a', new_string: `b ${EM_DASH} c` },
  }, { home })
  assert.equal(r.code, 0)
  assert.equal(r.output, null)
})

test('proposals in the rules home are not checked, and writes to active rules are denied before they happen', () => {
  const h = makeHome({ approve: false })
  const draft = `---\nid: x\nkind: forbid\npattern: '${EM_DASH}'\n---\nNo dashes.\n\n## Bad\na ${EM_DASH} b\n\n## Good\na, b\n`
  assert.equal(postWrite(h, 'proposed/x.md', draft, h).output, null)
  const r = hook({ hook_event_name: 'PreToolUse', tool_name: 'Write', cwd: h, tool_input: { file_path: join(h, 'rules', 'x.md'), content: draft } }, { home: h })
  assert.match(r.output.hookSpecificOutput.permissionDecisionReason, /off-limits/)
  assert.ok(!existsSync(join(h, 'rules', 'x.md')))
})

test('guards deny notwice approve, silent PR closes, pr-assets pushes, and printing .p8 keys with the example rule', () => {
  const repo = makeRepo()
  assert.ok(denied(preBash(repo, 'notwice approve no-em-dash')))
  assert.ok(denied(preBash(repo, 'mv ~/.notwice/proposed/x.md ~/.notwice/rules/')))
  assert.ok(denied(preBash(repo, 'gh pr close 12')))
  assert.equal(preBash(repo, 'gh pr close 12 --comment "Superseded by #13"').output, null)
  assert.ok(denied(preBash(repo, 'git push origin pr-assets')))
  const printKey = { hook_event_name: 'PreToolUse', tool_name: 'Bash', cwd: repo, tool_input: { command: 'cat ~/.appstoreconnect/private_keys/AuthKey_X.p8 | head' } }
  assert.equal(hook(printKey, { home }).output, null)
  assert.ok(denied(hook(printKey, { home: approveExample(makeHome(), 'no-print-p8') })))
  assert.equal(preBash(repo, 'notwice list && git status').output, null)
})

test('a commit message with an attribution trailer is denied before the commit', () => {
  const repo = makeRepo()
  const command = `git commit -m "$(cat <<'EOF'\nAdd thing\n\n${ATTRIBUTION}\nEOF\n)"`
  const r = preBash(repo, command)
  assert.ok(denied(r))
  assert.match(r.output.hookSpecificOutput.permissionDecisionReason, /no-claude-attribution/)
})

test('after a commit, a bad message is reported with the amend hint', () => {
  const repo = makeRepo()
  sessionStart(repo)
  commit(repo, { 'a.md': 'a\n' }, `Add a\n\n${ATTRIBUTION}`)
  const r = postBash(repo, 'git commit -F msg.txt')
  assert.equal(r.output.decision, 'block')
  assert.match(r.output.reason, /git commit --amend/)
})

test('push is denied while this session\'s commits or committed lines break rules', () => {
  const repo = makeRepo()
  sessionStart(repo)
  commit(repo, { 'a.md': 'clean\n' }, `Add a\n\n${ATTRIBUTION}`)
  assert.ok(denied(preBash(repo, 'git push -u origin feature', fakeGh())))
  gitIn(repo, 'commit', '--amend', '-qm', 'Add a')
  assert.equal(preBash(repo, 'git push -u origin feature', fakeGh()).output, null)
  commit(repo, { 'b.md': `${PRIVATE_KEY_LINE}\n` }, 'Add b')
  assert.match(preBash(repo, 'git push', fakeGh()).output.hookSpecificOutput.permissionDecisionReason, /no-private-key/)
})

test('gh pr create is denied above 300 added lines and for a body without the five sections', () => {
  const repo = makeRepo()
  commit(repo, { 'big.ts': 'x\n'.repeat(301), 'package-lock.json': 'y\n'.repeat(5000) }, 'Big change')
  const big = preBash(repo, `gh pr create --title "Big" --body "${GOOD_BODY}"`, fakeGh())
  assert.match(big.output.hookSpecificOutput.permissionDecisionReason, /301 added lines \(limit 300\)/)
  const small = makeRepo()
  commit(small, { 'small.ts': 'x\n'.repeat(300) }, 'Small change')
  assert.equal(preBash(small, `gh pr create --title "Small" --body "${GOOD_BODY}"`, fakeGh()).output, null)
  const sections = preBash(small, 'gh pr create --title "Small" --body "## Summary\nstuff"', fakeGh())
  assert.match(sections.output.hookSpecificOutput.permissionDecisionReason, /pr-sections/)
})

test('git push checks size only when the branch already has a PR', () => {
  const repo = makeRepo()
  commit(repo, { 'big.ts': 'x\n'.repeat(400) }, 'Big change')
  assert.equal(preBash(repo, 'git push', fakeGh()).output, null)
  const withPr = fakeGh([{ number: 7, title: 'Big', body: GOOD_BODY, state: 'OPEN' }])
  assert.ok(denied(preBash(repo, 'git push', withPr)))
})

test('after gh pr create, the PR body is fetched and checked', () => {
  const repo = makeRepo()
  const env = fakeGh([{ number: 3, title: `Add x ${EM_DASH} y`, body: GOOD_BODY, state: 'OPEN' }])
  const r = postBash(repo, 'gh pr create --fill', env)
  assert.equal(r.output.decision, 'block')
  assert.match(r.output.reason, /PR #3:1 \[no-em-dash\]/)
  assert.match(r.output.reason, /gh pr edit 3/)
})

test('violations and overrides are logged', () => {
  const h = makeHome()
  const repo = makeRepo()
  postWrite(repo, 'a.md', `x ${EM_DASH} y\nz ${EM_DASH} w notwice-allow no-em-dash\n`, h)
  const log = logOf(h)
  assert.ok(log.some((e) => e.type === 'violation' && e.rule === 'no-em-dash' && e.blocked && e.at === 'a.md:1'))
  assert.ok(log.some((e) => e.type === 'override' && e.rule === 'no-em-dash' && e.at === 'a.md:2'))
})

test('fails open: corrupted rules, bad stdin and missing git never block and get logged', () => {
  const h = makeHome()
  write(h, 'rules/broken.md', '---\nid: broken\nkind: forbid\npattern: (\n---\n')
  const repo = makeRepo()
  const r = postWrite(repo, 'a.md', `x ${EM_DASH} y\n`, h)
  assert.equal(r.output.decision, 'block')
  assert.match(readFileSync(join(h, 'errors.log'), 'utf8'), /Invalid regular expression/)
  const noGit = hook({ hook_event_name: 'Stop', cwd: repo }, { home: h, env: { PATH: '/nonexistent' } })
  assert.equal(noGit.code, 0)
  assert.equal(noGit.output, null)
})

test('invalid JSON on stdin exits 0 with no output', () => {
  const h = makeHome()
  const r = notwice(['hook'], { home: h, input: '{not json' })
  assert.equal(r.code, 0)
  assert.equal(r.stdout, '')
  assert.match(readFileSync(join(h, 'errors.log'), 'utf8'), /JSON/)
})

test('the PR check after gh pr create reads the new PR from the output, never a numeric flag value', () => {
  const repo = makeRepo()
  const env = fakeGh([{ number: 3, state: 'OPEN', title: 'Teammate', body: `Old ${EM_DASH} body` }, { number: 8, state: 'OPEN', title: 'Add x', body: GOOD_BODY }])
  const command = 'gh pr create --title "Add x" --milestone 3 --body "$BODY"'
  const r = hook({ hook_event_name: 'PostToolUse', tool_name: 'Bash', cwd: repo, tool_input: { command }, tool_response: { stdout: 'https://github.com/example/repo/pull/8\n', stderr: '' } }, { home, env })
  assert.equal(r.output, null)
  const calls = JSON.parse(readFileSync(env.FAKE_GH_STATE, 'utf8')).calls
  assert.deepEqual(calls.find((c) => c[1] === 'view').slice(0, 3), ['pr', 'view', '8'])
})
