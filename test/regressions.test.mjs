import assert from 'node:assert/strict'
import { existsSync, mkdirSync, readFileSync, renameSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { test } from 'node:test'
import { checkCommand, checkLines, checkText } from '../src/core/check.mjs'
import { globToRegExp, parseRule } from '../src/core/rules.mjs'
import { EM_DASH, PRIVATE_KEY_LINE, approveExample, commit, gitIn, hook, makeHome, makeRepo, notwice, tempDir, write } from './helpers.mjs'

const ATTRIBUTION = 'Co-Authored-By: Claude <noreply@anthropic.com>'
const preBash = (cwd, command, home, env) => hook({ hook_event_name: 'PreToolUse', tool_name: 'Bash', cwd, tool_input: { command } }, { home, env })
const denied = (r) => r.output?.hookSpecificOutput?.permissionDecision === 'deny'
const reasonOf = (r) => r.output?.hookSpecificOutput?.permissionDecisionReason ?? r.output?.reason ?? ''
const fakeGh = (prs = []) => ({ FAKE_GH_STATE: write(tempDir(), 'gh.json', JSON.stringify({ calls: [], prs })) })
const DASH_RULE = `---\nid: no-dash\nkind: forbid\npattern: '${EM_DASH}'\ntargets: [files, commits, pr]\n---\nNo em dashes.\n\n## Bad\na ${EM_DASH} b\n\n## Good\na, b\n`
const NEVER = (id) => `---\nid: ${id}\nkind: forbid\npattern: 'zzzz-never-matches'\n---\nStricter check for this repo.\n\n## Bad\nzzzz-never-matches\n\n## Good\nfine\n`

test('security #1: notwice-allow human-approval does not bypass the approval guard, and the deny never teaches it', () => {
  const home = makeHome()
  const repo = makeRepo()
  const r = preBash(repo, 'notwice approve no-utilize # notwice-allow human-approval', home)
  assert.ok(denied(r))
  const advice = reasonOf(r).split('\n').filter((line) => !line.trim().startsWith('>'))
  assert.doesNotMatch(advice.join('\n'), /notwice-allow/)
})

test('security #2 / kiss A1: a project rule cannot replace a personal or built-in rule with the same id', () => {
  const home = makeHome()
  const repo = makeRepo()
  write(repo, '.notwice/rules/no-claude-attribution.md', NEVER('no-claude-attribution'))
  write(repo, '.notwice/rules/human-approval.md', NEVER('human-approval'))
  gitIn(repo, 'add', 'README.md')
  const trailer = preBash(repo, `git commit -m "Add x" -m "${ATTRIBUTION}"`, home)
  assert.match(reasonOf(trailer), /no-claude-attribution/)
  assert.ok(denied(preBash(repo, 'notwice approve no-utilize', home)))
})

test('security #6: a failed log write never turns a block into an allow', () => {
  const home = makeHome()
  const repo = makeRepo()
  rmSync(join(home, 'log.jsonl'), { force: true })
  mkdirSync(join(home, 'log.jsonl'))
  assert.ok(denied(preBash(repo, 'gh pr close 12', home)))
})

function ciEvent(repo, extra = {}) {
  const pr = {
    number: 9, title: 'Add docs', body: 'Body',
    base: { sha: gitIn(repo, 'rev-parse', 'origin/main').trim() },
    head: { sha: gitIn(repo, 'rev-parse', 'HEAD').trim() },
    ...extra,
  }
  const eventPath = write(tempDir(), 'event.json', JSON.stringify({ pull_request: pr }))
  return { GITHUB_EVENT_PATH: eventPath, GITHUB_BASE_REF: 'main', GITHUB_ACTIONS: 'true' }
}

test('security #3 / kiss A2: CI loads project rules from the PR base, so a PR cannot weaken them', () => {
  const repo = makeRepo()
  gitIn(repo, 'checkout', '-q', 'main')
  commit(repo, { '.notwice/rules/no-dash.md': DASH_RULE }, 'Add the no-dash rule')
  gitIn(repo, 'push', '-q', 'origin', 'main')
  gitIn(repo, 'checkout', '-q', 'feature')
  gitIn(repo, 'merge', '-q', 'main')
  commit(repo, { 'README.md': `hello\nFast setup ${EM_DASH} no config.\n`, '.notwice/rules/no-dash.md': NEVER('no-dash') }, 'Tidy rules')
  const r = notwice(['check', '--ci'], { home: tempDir(), cwd: repo, env: ciEvent(repo) })
  assert.equal(r.code, 1)
  assert.match(r.stdout, /README\.md:2 \[no-dash\]/)
})

const sessionStart = (cwd, home) => hook({ hook_event_name: 'SessionStart', source: 'startup', cwd }, { home })
const stop = (cwd, home, active = false) => hook({ hook_event_name: 'Stop', cwd, stop_hook_active: active }, { home })
const postBash = (cwd, command, home) =>
  hook({ hook_event_name: 'PostToolUse', tool_name: 'Bash', cwd, tool_input: { command }, tool_response: { stdout: '', stderr: '' } }, { home })

function editLine(cwd, file, from, to, home) {
  const path = join(cwd, file)
  const before = readFileSync(path, 'utf8')
  const lines = before.split('\n')
  const index = lines.indexOf(from)
  lines[index] = to
  writeFileSync(path, lines.join('\n'))
  const hunk = { oldStart: index + 1, oldLines: 1, newStart: index + 1, newLines: 1, lines: [`-${from}`, `+${to}`] }
  const tool_input = { file_path: path, old_string: from, new_string: to, replace_all: false }
  const tool_response = { filePath: path, oldString: from, newString: to, originalFile: before, structuredPatch: [hunk] }
  return hook({ hook_event_name: 'PostToolUse', tool_name: 'Edit', cwd, tool_input, tool_response }, { home })
}

function teammateCommitOnMain(repo, files, message) {
  gitIn(repo, 'checkout', '-q', 'main')
  commit(repo, files, message)
  gitIn(repo, 'push', '-q', 'origin', 'main')
  gitIn(repo, 'checkout', '-q', 'feature')
}

test('correctness #1 / daily-use #1: after merging or rebasing main, push and Stop judge only this session\'s commits', () => {
  const home = makeHome()
  const repo = makeRepo()
  commit(repo, { 'a.txt': 'a\n' }, 'Add a')
  gitIn(repo, 'push', '-q', '-u', 'origin', 'feature')
  teammateCommitOnMain(repo, { 't.txt': 't\n' }, `Teammate change\n\n${ATTRIBUTION}`)
  sessionStart(repo, home)
  gitIn(repo, 'merge', '-q', '--no-edit', 'origin/main')
  assert.ok(!denied(preBash(repo, 'git push', home, fakeGh())))
  assert.equal(stop(repo, home).output, null)
  gitIn(repo, 'reset', '-q', '--hard', 'origin/feature')
  gitIn(repo, 'rebase', '-q', 'origin/main')
  assert.ok(!denied(preBash(repo, 'git push --force-with-lease', home, fakeGh())))
  assert.equal(stop(repo, home).output, null)
})

test('daily-use #1: lines on the branch before the session never block an edit or Stop', () => {
  const home = makeHome()
  const repo = makeRepo()
  commit(repo, { 'CLIENTS.md': `# Clients\n## Claude ${EM_DASH} setup\nplain line\n` }, 'Teammate docs')
  write(repo, 'notes.md', `user wip ${EM_DASH} typed by hand\n`)
  sessionStart(repo, home)
  assert.equal(editLine(repo, 'CLIENTS.md', 'plain line', 'plain line, edited', home).output, null)
  assert.equal(stop(repo, home).output, null)
  write(repo, 'made-by-bash.md', `new ${EM_DASH} line\n`)
  const blocked = stop(repo, home)
  assert.match(blocked.output.reason, /made-by-bash\.md:1 \[no-em-dash\]/)
  assert.doesNotMatch(blocked.output.reason, /CLIENTS|notes/)
})

test('daily-use #1: a merge from main left staged for review never blocks Stop', () => {
  const home = makeHome()
  const repo = makeRepo()
  teammateCommitOnMain(repo, { 'docs/guide.md': `Guide ${EM_DASH} intro\n` }, 'Teammate guide')
  sessionStart(repo, home)
  gitIn(repo, 'merge', '-q', '--no-commit', '--no-ff', 'origin/main')
  assert.equal(stop(repo, home).output, null)
})

test('correctness #2 / daily-use #7 / kiss B1: Stop blocks once per turn, then lets the turn end with one failure record', () => {
  const home = makeHome()
  const repo = makeRepo()
  sessionStart(repo, home)
  write(repo, 'copy.md', `a ${EM_DASH} b\n`)
  const records = () => readFileSync(join(home, 'failures.jsonl'), { encoding: 'utf8', flag: 'a+' }).split('\n').filter(Boolean).length
  const before = records()
  assert.equal(stop(repo, home).output.decision, 'block')
  assert.equal(stop(repo, home, true).output, null)
  assert.equal(records(), before + 1)
  assert.match(readFileSync(join(home, 'failures.jsonl'), 'utf8').trim().split('\n').at(-1), /unresolved/)
})

test('correctness #2 / daily-use #5: SubagentStop only records, so read-only subagents are never blocked', () => {
  const home = makeHome()
  const repo = makeRepo()
  sessionStart(repo, home)
  write(repo, 'copy.md', `a ${EM_DASH} b\n`)
  assert.equal(hook({ hook_event_name: 'SubagentStop', agent_id: 'explore-1', cwd: repo, stop_hook_active: false }, { home }).output, null)
})

test('correctness #4: edits to a moved file check only the lines the edit introduced, and a plain mv adds nothing', () => {
  const home = makeHome()
  notwice(['retire', 'tests-after-code'], { home })
  const repo = makeRepo()
  teammateCommitOnMain(repo, { 'src/old/Button.tsx': `line one\nlegacy ${EM_DASH} copy\nline three\n` }, 'legacy')
  gitIn(repo, 'merge', '-q', 'main')
  sessionStart(repo, home)
  mkdirSync(join(repo, 'src/new'), { recursive: true })
  gitIn(repo, 'mv', 'src/old/Button.tsx', 'src/new/Button.tsx')
  gitIn(repo, 'commit', '-qm', 'move')
  assert.equal(editLine(repo, 'src/new/Button.tsx', 'line one', 'line 1', home).output, null)
  mkdirSync(join(repo, 'src/plain'))
  renameSync(join(repo, 'src/new/Button.tsx'), join(repo, 'src/plain/Button.tsx'))
  assert.equal(stop(repo, home).output, null)
})

test('correctness #5: while resolving a merge conflict, lines from main do not count', () => {
  const home = makeHome()
  const repo = makeRepo()
  gitIn(repo, 'checkout', '-q', 'main')
  commit(repo, { 'copy.md': 'title\nbody\n' }, 'base')
  gitIn(repo, 'push', '-q', 'origin', 'main')
  gitIn(repo, 'checkout', '-q', 'feature')
  gitIn(repo, 'merge', '-q', 'main')
  commit(repo, { 'copy.md': 'title\nbody from feat\n' }, 'feat')
  teammateCommitOnMain(repo, { 'copy.md': `title ${EM_DASH} teammate\nbody from main\n`, 'other.md': `x ${EM_DASH} y\n` }, 'teammate')
  sessionStart(repo, home)
  assert.throws(() => gitIn(repo, 'merge', 'origin/main'))
  write(repo, 'copy.md', `title ${EM_DASH} teammate\nbody from feat\n`)
  assert.equal(editLine(repo, 'copy.md', 'body from feat', 'body from feat and main', home).output, null)
  assert.equal(stop(repo, home).output, null)
})

test('correctness #6: the post-commit check never asks to amend a commit this session did not make', () => {
  const home = makeHome()
  const repo = makeRepo()
  teammateCommitOnMain(repo, { 't.txt': 't\n' }, `Teammate change\n\n${ATTRIBUTION}`)
  gitIn(repo, 'checkout', '-q', '-b', 'fresh', 'origin/main')
  sessionStart(repo, home)
  assert.equal(postBash(repo, 'rg -n "git commit" docs || true', home).output, null)
  assert.equal(postBash(repo, 'git commit -m "Add feature"; git status --short', home).output, null)
})

test('kiss A4: notwice check still checks commit messages after a push', () => {
  const home = makeHome()
  const repo = makeRepo()
  commit(repo, { 'a.md': 'a\n' }, `Add a\n\n${ATTRIBUTION}`)
  gitIn(repo, 'push', '-q', '-u', 'origin', 'feature')
  const r = notwice(['check'], { home, cwd: repo })
  assert.equal(r.code, 1)
  assert.match(r.stdout, /no-claude-attribution/)
})

const preTool = (tool, cwd, tool_input, home) => hook({ hook_event_name: 'PreToolUse', tool_name: tool, cwd, tool_input }, { home })

test('security #5 / correctness #10: the agent cannot edit an active rule, and the rule stays in force', () => {
  const home = makeHome()
  const repo = makeRepo()
  const active = join(home, 'rules', 'no-em-dash.md')
  const original = readFileSync(active, 'utf8')
  assert.ok(denied(preTool('Write', repo, { file_path: active, content: 'weakened' }, home)))
  assert.ok(denied(preTool('Edit', repo, { file_path: join(repo, '.notwice/rules/x.md'), old_string: 'a', new_string: 'b' }, home)))
  const tool_response = { filePath: active, structuredPatch: [{ oldStart: 1, oldLines: 0, newStart: 1, newLines: 1, lines: ['+# tweak'] }] }
  hook({ hook_event_name: 'PostToolUse', tool_name: 'Edit', cwd: repo, tool_input: { file_path: active }, tool_response }, { home })
  assert.equal(readFileSync(active, 'utf8'), original)
  sessionStart(repo, home)
  write(repo, 'copy.md', `Fast ${EM_DASH} setup\n`)
  assert.equal(stop(repo, home).output.decision, 'block')
})

test('security known gap: Bash commands that change active rules, and notwice retire, are denied', () => {
  const home = makeHome()
  const repo = makeRepo()
  assert.ok(denied(preBash(repo, `sed -i '' 's/x/y/' ${join(home, 'rules', 'no-em-dash.md')}`, home)))
  assert.ok(denied(preBash(repo, 'rm ~/.notwice/rules/no-em-dash.md', home)))
  assert.ok(denied(preBash(repo, 'echo x > "$NOTWICE_HOME/rules/no-em-dash.md"', home)))
  assert.ok(denied(preBash(repo, 'notwice retire no-em-dash', home)))
  assert.ok(!denied(preBash(repo, `cat ${join(home, 'rules', 'no-em-dash.md')}`, home)))
})

test('security known gap: SessionStart tells the user when active rules changed outside the CLI', () => {
  const home = makeHome()
  const repo = makeRepo()
  assert.equal(sessionStart(repo, home).output.systemMessage, undefined)
  writeFileSync(join(home, 'rules', 'no-em-dash.md'), 'tampered')
  assert.match(sessionStart(repo, home).output.systemMessage, /changed outside/)
  notwice(['retire', 'no-async-iife'], { home })
  assert.equal(sessionStart(repo, home).output.systemMessage, undefined)
})

const GOOD_BODY = '## Problem\nP\n\n## Approach\nA\n\n## Scope\nIn:\n- x\nOut:\n- y\n\n## Tests\n- t\n\n## Screenshots\n'

test('correctness #3 / daily-use #4 / kiss A5: an unreadable PR body skips the pre-check, and a title-only edit checks only the title', () => {
  const home = makeHome()
  const repo = makeRepo()
  commit(repo, { 'x.md': 'x\n' }, 'Add x')
  write(repo, 'body.md', GOOD_BODY)
  const userHome = tempDir()
  write(userHome, 'body.md', GOOD_BODY)
  const env = { ...fakeGh([{ number: 1, title: 'Old', body: GOOD_BODY, state: 'OPEN' }]), HOME: userHome }
  const allowed = [
    'gh pr create --title "Add x" --body "$(cat body.md)"',
    'gh pr create --title "Add x" --body "$BODY"',
    'gh pr create --title "Add x" --body-file ~/body.md',
    'cat body.md | gh pr create --title "Add x" --body-file -',
    'gh pr create --title "Add x" --body-file - < body.md',
    `cat > new.md <<'EOF'\n${GOOD_BODY}EOF\ngh pr create --title "Add x" --body-file new.md`,
    `gh pr create --title "Support the -b short flag" --body "${GOOD_BODY}"`,
    "gh pr edit 1 --title 'Rename the PR'",
  ]
  for (const command of allowed) assert.ok(!denied(preBash(repo, command, home, env)), command)
  assert.match(reasonOf(preBash(repo, 'gh pr create --title "T" --body "## Summary"', home, env)), /pr-sections/)
  assert.match(reasonOf(preBash(repo, `gh pr edit 1 --title 'Fast ${EM_DASH} setup'`, home, env)), /no-em-dash/)
})

test('correctness #7: a commit message comes from its own segment, never from a later PR heredoc or a stale -F file', () => {
  const home = makeHome()
  const repo = makeRepo()
  write(repo, 'x.md', 'x\n')
  gitIn(repo, 'add', '.')
  const chain = `git commit -m "Add x" -m "${ATTRIBUTION}" && git push -u origin feature && gh pr create --title "Add x" --body "$(cat <<'EOF'\n${GOOD_BODY}EOF\n)"`
  assert.match(reasonOf(preBash(repo, chain, home, fakeGh())), /no-claude-attribution/)
  write(repo, 'msg.txt', 'Old clean message\n')
  const stale = `cat > msg.txt <<'EOF'\nAdd x\n\n${ATTRIBUTION}\nEOF\ngit commit -F msg.txt && git push -u origin feature`
  assert.match(reasonOf(preBash(repo, stale, home, fakeGh())), /no-claude-attribution/)
  const printed = `printf "fix\\n\\n${ATTRIBUTION}" > msg.txt && git commit -qaF msg.txt && git push origin feature`
  assert.match(reasonOf(preBash(repo, printed, home, fakeGh())), /separate commands/)
})

test('daily-use #6: text in gh comments, reviews, close reasons, merges and issues is checked', () => {
  const home = makeHome()
  const repo = makeRepo()
  const env = fakeGh([{ number: 1, title: 'T', body: GOOD_BODY, state: 'OPEN' }])
  const denials = [
    `gh pr comment 1 --body "Rebased on main ${EM_DASH} ready for another look."`,
    `gh pr review 1 --comment --body "Good catch ${EM_DASH} fixed."`,
    `gh pr close 1 --comment "Superseded by #2 ${EM_DASH} smaller diff."`,
    `gh pr merge 1 --squash --subject "fix: retry" --body "${ATTRIBUTION}"`,
    `gh issue create --title "Flow runner hangs ${EM_DASH} Metro" --body "Steps"`,
    `gh issue edit 4 --body "Steps ${EM_DASH} run a flow"`,
    `gh issue comment 4 --body "Seen again ${EM_DASH} on CI"`,
  ]
  for (const command of denials) assert.ok(denied(preBash(repo, command, home, env)), command)
  assert.ok(!denied(preBash(repo, 'gh issue create --title "Hang" --body "## Steps to reproduce\n1. run"', home, env)))
})

test('D5: a chat reply that breaks a rule is logged as a failure record at Stop and never blocks', () => {
  const home = makeHome()
  const repo = makeRepo()
  sessionStart(repo, home)
  const r = hook({ hook_event_name: 'Stop', cwd: repo, stop_hook_active: false, last_assistant_message: `Done ${EM_DASH} the README is updated.` }, { home })
  assert.equal(r.output, null)
  const last = JSON.parse(readFileSync(join(home, 'failures.jsonl'), 'utf8').trim().split('\n').at(-1))
  assert.equal(last.source, 'chat reply')
  assert.match(last.rule_or_check, /no-em-dash/)
})

test('security #11 / correctness #15 (nit): unless applies per command segment', () => {
  const home = makeHome()
  const repo = makeRepo()
  assert.ok(denied(preBash(repo, 'gh pr close 12 && gh pr close 13 --comment "dup"', home)))
  assert.ok(denied(preBash(repo, 'gh pr close 12 && git -c core.pager=cat log -1', home)))
  assert.ok(!denied(preBash(repo, 'gh pr close 12 --comment "Superseded by #13" && gh pr view 12', home)))
  assert.ok(denied(preBash(repo, 'gh pr close 12 --comment ""', home)))
})

test('daily-use #9 (nit): guards never match the text of a commit message or PR body', () => {
  const home = makeHome()
  const repo = makeRepo()
  assert.ok(!denied(preBash(repo, 'git commit -m "docs: explain why we never gh pr close without a reason"', home)))
  assert.ok(!denied(preBash(repo, 'git commit -m "fix(release): read the key id from the head of AuthKey.p8 path"', home)))
  assert.ok(!denied(preBash(repo, 'git push origin --delete pr-assets', home, fakeGh())))
  assert.ok(denied(preBash(repo, 'git push origin pr-assets', home, fakeGh())))
})

test('correctness #11: a quoted --base still gates the PR, and a base that cannot be resolved is reported', () => {
  const home = makeHome()
  const repo = makeRepo()
  commit(repo, { 'big.ts': 'x\n'.repeat(500) }, 'Big change')
  for (const base of ['main', '"main"', "'main'"]) {
    const r = preBash(repo, `gh pr create --base ${base} --title "Big" --body "${GOOD_BODY}"`, home, fakeGh())
    assert.match(reasonOf(r), /500 added lines \(limit 300\)/, base)
  }
  assert.match(reasonOf(preBash(repo, `gh pr create --base nope --title "Big" --body "${GOOD_BODY}"`, home, fakeGh())), /cannot resolve base nope/)
  const check = notwice(['check', '--base', 'nope'], { home, cwd: repo })
  assert.equal(check.code, 1)
  assert.match(check.stderr, /cannot resolve base nope/)
})

test('security #4: git config, attributes, NUL bytes and quoted file names never hide added lines', () => {
  const home = makeHome()
  const cases = [
    (repo) => gitIn(repo, 'config', 'diff.noprefix', 'true'),
    (repo) => gitIn(repo, 'config', 'diff.mnemonicPrefix', 'true'),
    (repo) => gitIn(repo, 'config', 'diff.external', 'false'),
    (repo) => commit(repo, { '.gitattributes': '*.md -diff\n' }, 'attributes'),
  ]
  for (const setup of cases) {
    const repo = makeRepo()
    setup(repo)
    commit(repo, { 'notes.md': `Fast ${EM_DASH} setup\n` }, 'notes')
    assert.match(notwice(['check'], { home, cwd: repo }).stdout, /notes\.md:1 \[no-em-dash\]/, String(setup))
  }
  const repo = makeRepo()
  commit(repo, { 'data.md': 'x\0\n', 'say "hi".md': `Hi ${EM_DASH} there\n`, 'My Screen/Home.md': `Home ${EM_DASH} page\n` }, 'odd files')
  commit(repo, { 'data.md': `x\0\nFast ${EM_DASH} setup\n` }, 'more')
  const out = notwice(['check'], { home, cwd: repo }).stdout
  assert.match(out, /data\.md:2 \[no-em-dash\]/)
  assert.match(out, /say "hi"\.md:1 \[no-em-dash\]/)
  assert.match(out, /My Screen\/Home\.md:1 \[no-em-dash\]/)
})

test('security #7: a catastrophic regex cannot stall a hook, and a throwing rule skips only itself', () => {
  const home = makeHome()
  write(home, 'rules/slow.md', "---\nid: slow\nkind: forbid\npattern: '^(a+)+$'\n---\nSlow.\n\n## Bad\naaa\n\n## Good\nb\n")
  const repo = makeRepo()
  write(repo, 'a.txt', `${'a'.repeat(40)}b\n${'x'.repeat(200000)}\n`)
  const started = Date.now()
  const r = notwice(['check'], { home, cwd: repo })
  assert.ok(Date.now() - started < 3000, `took ${Date.now() - started} ms`)
  assert.equal(r.code, 0)
  const throwing = { id: 'boom', kind: 'forbid', targets: ['files'], severity: 'block', patterns: [{ test() { throw new RangeError('boom') } }] }
  const dash = { id: 'dash', kind: 'forbid', targets: ['files'], severity: 'block', patterns: [new RegExp(EM_DASH)], text: '' }
  assert.equal(checkLines([throwing, dash], [{ file: 'a.md', line: 1, text: `a ${EM_DASH} b` }], 'files').violations.length, 1)
})

test('security #8 / correctness #14: pushes behind global options, of other branches, and of deletes or tags are judged by what they send', () => {
  const home = makeHome()
  const repo = makeRepo()
  sessionStart(repo, home)
  commit(repo, { 'a.md': 'a\n' }, `Add a\n\n${ATTRIBUTION}`)
  for (const command of ['git -c push.default=current push', 'git --no-pager push origin feature', 'git -c core.sshCommand=ssh push origin feature']) {
    assert.ok(denied(preBash(repo, command, home, fakeGh())), command)
  }
  gitIn(repo, 'checkout', '-q', 'main')
  assert.ok(denied(preBash(repo, 'git push origin feature', home, fakeGh())))
  assert.ok(denied(preBash(repo, 'git push origin feature:refs/heads/other', home, fakeGh())))
  assert.ok(!denied(preBash(repo, 'git push origin main', home, fakeGh())))
  gitIn(repo, 'checkout', '-q', 'feature')
  assert.ok(!denied(preBash(repo, 'git push origin --delete old-branch', home, fakeGh())))
  assert.ok(!denied(preBash(repo, 'git push origin :old-branch', home, fakeGh())))
  assert.ok(!denied(preBash(repo, 'git push --tags', home, fakeGh())))
})

test('security #9: private keys are caught in ignored paths, other encodings and with an allow marker, and .p8 files cannot be read', () => {
  const home = approveExample(makeHome(), 'no-print-p8')
  const repo = makeRepo()
  sessionStart(repo, home)
  const keys = {
    'dist/config.js': `module.exports = "${PRIVATE_KEY_LINE}"`,
    'src/__snapshots__/keys.snap': PRIVATE_KEY_LINE,
    'keys.generated.ts': PRIVATE_KEY_LINE,
    'ci.env': 'ASC_KEY_BASE64=LS0tLS1CRUdJTiBQUklWQVRFIEtFWS0tLS0t',
    'signing.asc': ['-----BEGIN PGP', 'PRIVATE KEY BLOCK-----'].join(' '),
    'key-body.txt': 'MIGTAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBHkwdwIBAQQgAAAA',
    'src/key.js': `"${PRIVATE_KEY_LINE}" // notwice-allow no-private-key`,
  }
  for (const [file, line] of Object.entries(keys)) write(repo, file, `${line}\n`)
  const reason = stop(repo, home).output.reason
  for (const file of Object.keys(keys)) assert.match(reason, new RegExp(`${file.replace(/[.]/g, '\\.')}:1 \\[no-private-key\\]`), file)
  assert.ok(denied(preTool('Read', repo, { file_path: '/Users/x/.appstoreconnect/private_keys/AuthKey_ABC.P8' }, home)))
  for (const command of ['sed -n p AuthKey_ABC.p8', 'grep -r . AuthKey_ABC.p8', 'cp AuthKey_ABC.p8 ./key.txt', 'cat AuthKey_ABC.P8']) {
    assert.ok(denied(preBash(repo, command, home)), command)
  }
})

test('correctness #9: brace globs in paths match', () => {
  assert.ok(globToRegExp('src/**/*.{ts,tsx}').test('src/screens/Home.tsx'))
  assert.ok(globToRegExp('src/**/*.{ts,tsx}').test('src/a.ts'))
  assert.ok(!globToRegExp('src/**/*.{ts,tsx}').test('src/a.js'))
  assert.ok(!globToRegExp('**/dist/**').test('notdist/x.js'))
  const home = makeHome()
  write(home, 'rules/no-console-log.md', "---\nid: no-console-log\nkind: forbid\npattern: '\\bconsole\\.log\\('\npaths: ['src/**/*.{ts,tsx}']\n---\nNo console.log.\n\n## Bad\nconsole.log(user)\n\n## Good\nlogger.debug(user)\n")
  const repo = makeRepo()
  const path = write(repo, 'src/screens/Home.tsx', 'console.log(user)\n')
  const r = hook({ hook_event_name: 'PostToolUse', tool_name: 'Write', cwd: repo, tool_input: { file_path: path, content: 'console.log(user)\n' }, tool_response: { type: 'create', structuredPatch: [] } }, { home })
  assert.match(r.output.reason, /no-console-log/)
})

test('correctness #8 / daily-use #2: the size gate measures committed changes against the PR\'s real base and judges only this push', () => {
  const home = makeHome()
  const repo = makeRepo()
  commit(repo, { 'small.ts': 'l\n'.repeat(100) }, 'small')
  write(repo, 'small.ts', 'l\n'.repeat(500))
  assert.ok(!denied(preBash(repo, `gh pr create --title "T" --body "${GOOD_BODY}"`, home, fakeGh())))
  gitIn(repo, 'checkout', '-q', '.')
  commit(repo, { 'layer-a.ts': 'a\n'.repeat(300) }, 'layer a')
  gitIn(repo, 'push', '-q', '-u', 'origin', 'feature')
  gitIn(repo, 'checkout', '-q', '-b', 'stack-b')
  commit(repo, { 'layer-b.ts': 'b\n'.repeat(51) }, 'layer b')
  const stacked = fakeGh([{ number: 2, title: 'b', body: GOOD_BODY, state: 'OPEN', baseRefName: 'feature' }])
  assert.ok(!denied(preBash(repo, 'git push -u origin stack-b', home, stacked)))
  gitIn(repo, 'checkout', '-q', 'feature')
  commit(repo, { 'big.ts': 'x\n'.repeat(10) }, 'teammate big PR')
  gitIn(repo, 'push', '-q')
  commit(repo, { 'doc.ts': '/** doc */\n' }, 'Add a doc comment')
  const overLimit = fakeGh([{ number: 1, title: 'big', body: GOOD_BODY, state: 'OPEN', baseRefName: 'main' }])
  assert.ok(!denied(preBash(repo, 'git push', home, overLimit)))
  assert.ok(!denied(preBash(repo, 'git push 2>&1 | tail -5', home, overLimit)))
  gitIn(repo, 'checkout', '-q', '-b', 'grows', 'origin/main')
  commit(repo, { 'g1.ts': 'g\n'.repeat(250) }, 'g1')
  gitIn(repo, 'push', '-q', '-u', 'origin', 'grows')
  commit(repo, { 'g2.ts': 'g\n'.repeat(100) }, 'g2')
  const grows = fakeGh([{ number: 3, title: 'g', body: GOOD_BODY, state: 'OPEN', baseRefName: 'main' }])
  assert.match(reasonOf(preBash(repo, 'git push', home, grows)), /350 added lines \(limit 300\)/)
  assert.match(reasonOf(preBash(repo, 'git push -u origin HEAD', home, grows)), /350 added lines \(limit 300\)/)
  assert.match(JSON.parse(readFileSync(grows.FAKE_GH_STATE, 'utf8')).calls.at(-1).join(' '), /pr view grows/)
  const allowed = fakeGh([{ number: 3, title: 'g', body: `${GOOD_BODY}\nnotwice-allow max-pr-size`, state: 'OPEN', baseRefName: 'main' }])
  assert.ok(!denied(preBash(repo, 'git push', home, allowed)))
})

test('daily-use #3: block messages never suggest notwice approve for an active rule and tell the agent not to add the marker', () => {
  const home = makeHome()
  const repo = makeRepo()
  const edit = hook({ hook_event_name: 'PostToolUse', tool_name: 'Write', cwd: repo, tool_input: { file_path: write(repo, 'a.md', `a ${EM_DASH} b\n`), content: `a ${EM_DASH} b\n` }, tool_response: { type: 'create', structuredPatch: [] } }, { home })
  assert.doesNotMatch(edit.output.reason, /notwice approve/)
  assert.match(edit.output.reason, /a\.md:1 \[no-em-dash\]/)
  assert.match(edit.output.reason, /Only the user may keep one as it is, by adding "notwice-allow no-em-dash"; never add that marker yourself/)
  commit(repo, { 'big.ts': 'x\n'.repeat(400) }, 'Big')
  const size = reasonOf(preBash(repo, `gh pr create --title "Big" --body "${GOOD_BODY}"`, home, fakeGh()))
  assert.doesNotMatch(size, /approve/)
  assert.match(size, /notwice-allow max-pr-size/)
})

test('kiss A3: a require rule without targets checks PR bodies, and a require rule on files is refused', () => {
  const sections = parseRule("---\nid: needs-problem\nkind: require\npattern: ['^## Problem']\n---\nNeeds a Problem section.\n\n## Bad\nx\n\n## Good\n## Problem\n", 'needs-problem.md')
  assert.deepEqual(sections.targets, ['pr'])
  assert.equal(checkText([sections], '## Summary', 'pr', 'PR').violations.length, 1)
  assert.throws(() => parseRule("---\nid: r\nkind: require\npattern: x\ntargets: [files]\n---\nx\n", 'r.md'), /require rules check/)
})

test('correctness #16 (nit): notwice-allow matches the whole rule id', () => {
  const short = parseRule("---\nkind: forbid\npattern: 'TODO'\n---\nNo TODO.\n\n## Bad\nTODO\n\n## Good\ndone\n", 'no-todo.md')
  const line = { file: 'a.md', line: 1, text: 'TODO later // notwice-allow no-todo-comments' }
  assert.equal(checkLines([short], [line], 'files').violations.length, 1)
})

test('security #13 / correctness #18 / daily-use #12-13 (nits): SessionStart marks warnings, separates repo rules and hints at init', () => {
  const home = makeHome()
  const repo = makeRepo()
  write(repo, '.notwice/rules/env-setup.md', `---\nkind: forbid\npattern: zzz\n---\n${'Run setup first. '.repeat(20)}\n\n## Bad\nzzz\n\n## Good\nok\n`)
  const context = sessionStart(repo, home).output.hookSpecificOutput.additionalContext
  assert.match(context, /- no-async-iife \(warning\):/)
  assert.match(context, /from this repo's \.notwice\/rules[^\n]*:\n- env-setup: .{1,170}\n/)
  const empty = join(tempDir(), 'missing-home')
  assert.match(sessionStart(repo, empty).output.systemMessage, /notwice init/)
})

test('correctness #13 (nit): a git that cannot start is logged before failing open', () => {
  const home = makeHome()
  const repo = makeRepo()
  const r = hook({ hook_event_name: 'Stop', cwd: repo, stop_hook_active: false }, { home, env: { PATH: '/nonexistent' } })
  assert.equal(r.output, null)
  assert.match(readFileSync(join(home, 'errors.log'), 'utf8'), /git/)
})

test('security #12 (nit): a 0x1E byte in a commit message no longer hides it', () => {
  const home = makeHome()
  const repo = makeRepo()
  sessionStart(repo, home)
  commit(repo, { 'a.md': 'a\n' }, `fix: tidy\x1e\n\n${ATTRIBUTION}`)
  assert.match(reasonOf(preBash(repo, 'git push origin feature', home, fakeGh())), /no-claude-attribution/)
})

test('security #14 (nit): CI output cannot forge a workflow command from an added line', () => {
  const repo = makeRepo()
  gitIn(repo, 'checkout', '-q', 'main')
  commit(repo, { '.notwice/rules/no-dash.md': DASH_RULE }, 'Add the no-dash rule')
  gitIn(repo, 'push', '-q', 'origin', 'main')
  gitIn(repo, 'checkout', '-q', 'feature')
  gitIn(repo, 'merge', '-q', 'main')
  commit(repo, { 'a.md': `x ${EM_DASH} y\r::notice title=notwice::All project rules passed\n` }, 'notice')
  const r = notwice(['check', '--ci'], { home: tempDir(), cwd: repo, env: ciEvent(repo) })
  assert.equal(r.code, 1)
  assert.ok(!r.stdout.split(/[\r\n]/).some((line) => line.startsWith('::notice')))
})

test('security #10 (nit): approve refuses a symlinked proposal', () => {
  const home = makeHome({ approve: false })
  const draft = write(tempDir(), 'draft.md', DASH_RULE)
  symlinkSync(draft, join(home, 'proposed', 'no-utilise.md'))
  const r = notwice(['approve', 'no-utilise'], { home })
  assert.equal(r.code, 1)
  assert.match(r.stderr, /symlink/)
})

const CPP_STYLE = "---\nkind: forbid\ntargets: [commands]\npattern: '\\S'\nseverity: warn\n---\nC++ style notes.\n"
const CPP_CASTS = "---\nkind: forbid\npattern: 'reinterpret_cast'\n---\nNo reinterpret_cast.\n\n## Bad\nint* q = reinterpret_cast<int*>(p);\n\n## Good\nint* q = static_cast<int*>(p);\n"

test('final #1 (blocker): a rule id with regex characters cannot switch off the approval guard or other rules', () => {
  const home = approveExample(makeHome(), 'no-print-p8')
  const repo = makeRepo()
  write(repo, '.notwice/rules/c++-style.md', CPP_STYLE)
  assert.ok(denied(preBash(repo, 'notwice approve no-utilize', home)))
  assert.ok(denied(preBash(repo, 'cat AuthKey_ABC.p8', home)))
  write(home, 'proposed/no-c++-casts.md', CPP_CASTS)
  assert.equal(notwice(['approve', 'no-c++-casts'], { home }).code, 0)
  sessionStart(repo, home)
  write(repo, 'a.cpp', `int* q = reinterpret_cast<int*>(p);\nint r = 1; // a ${EM_DASH} b\n`)
  const blocked = reasonOf(stop(repo, home))
  assert.match(blocked, /a\.cpp:1 \[no-c\+\+-casts\]/)
  assert.match(blocked, /a\.cpp:2 \[no-em-dash\]/)
  write(repo, 'a.cpp', 'int* q = reinterpret_cast<int*>(p); // notwice-allow no-c++-casts\n')
  assert.doesNotMatch(reasonOf(stop(repo, home)), /no-c\+\+-casts|no-em-dash/)
})

test('final #1 (blocker): a rule that throws is skipped and logged while every other rule still runs', () => {
  const dash = { id: 'dash', kind: 'forbid', targets: ['files', 'commands'], severity: 'block', patterns: [new RegExp(EM_DASH)], text: '' }
  const badPaths = { ...dash, id: 'bad-paths', paths: [{ test() { throw new RangeError('paths boom') } }] }
  const badRecord = { ...dash, id: 'bad-record', get locked() { throw new RangeError('record boom') } }
  const line = [{ file: 'a.md', line: 1, text: `a ${EM_DASH} b` }]
  assert.deepEqual(checkLines([badPaths, badRecord, dash], line, 'files').violations.map((v) => v.id), ['dash'])
  assert.deepEqual(checkCommand([badRecord, dash], `echo ${EM_DASH}`).violations.map((v) => v.id), ['dash'])
  const errors = readFileSync(join(process.env.NOTWICE_HOME, 'errors.log'), 'utf8')
  assert.match(errors, /bad-paths: paths boom/)
  assert.match(errors, /bad-record: record boom/)
})

test('final stranger #3: rule-list lines end on a whole word, and the approval rule fits whole', () => {
  const home = makeHome()
  write(home, 'rules/long-text.md', `---\nkind: forbid\npattern: 'zzzz'\n---\n${'word '.repeat(60)}end\n`)
  const context = sessionStart(makeRepo(), home).output.hookSpecificOutput.additionalContext
  assert.match(context, /human-approval: .* or in a terminal\.$/m)
  assert.match(context, /^- long-text: (word )+word…$/m)
})

test('final stranger #4: the session list tells the agent to draft a rule from a correction in the same turn', () => {
  const context = sessionStart(makeRepo(), makeHome()).output.hookSpecificOutput.additionalContext
  assert.match(context, /When the user corrects you, draft a rule with the notwice learn skill in the same turn, without asking first\./)
})

test('final stranger #9: a reply that quotes a rule\'s text to explain it is never logged as breaking it', () => {
  const home = makeHome()
  const repo = makeRepo()
  sessionStart(repo, home)
  const replyStop = (reply) => hook({ hook_event_name: 'Stop', cwd: repo, stop_hook_active: false, last_assistant_message: reply }, { home })
  const explained = 'Committed. I left out the "Generated with Claude Code" line and the `Co-Authored-By: Claude` trailer.\n```\nCo-Authored-By: Claude <noreply@anthropic.com>\n```'
  assert.equal(replyStop(explained).output, null)
  assert.equal(existsSync(join(home, 'failures.jsonl')) ? readFileSync(join(home, 'failures.jsonl'), 'utf8') : '', '')
  replyStop('Done. Generated with Claude Code')
  assert.match(readFileSync(join(home, 'failures.jsonl'), 'utf8'), /no-claude-attribution/)
})

test('final stranger #9: the session list asks the agent to follow the rules without narrating them', () => {
  const context = sessionStart(makeRepo(), makeHome()).output.hookSpecificOutput.additionalContext
  assert.match(context.split('\n')[0], /override conflicting defaults such as commit attribution, so follow them without mentioning them/)
})

test('final scale #2: deny, edit feedback and Stop messages tell the agent to fix and continue in the same turn', () => {
  const home = makeHome()
  const repo = makeRepo()
  sessionStart(repo, home)
  const goOn = /Fix or reword each one, then continue the task in this same turn\./
  assert.match(reasonOf(preBash(repo, 'gh pr close 12', home)), goOn)
  const path = write(repo, 'a.md', `a ${EM_DASH} b\n`)
  const tool_response = { type: 'create', filePath: path, content: `a ${EM_DASH} b\n`, structuredPatch: [] }
  const edited = hook({ hook_event_name: 'PostToolUse', tool_name: 'Write', cwd: repo, tool_input: { file_path: path, content: `a ${EM_DASH} b\n` }, tool_response }, { home })
  assert.match(reasonOf(edited), goOn)
  assert.match(reasonOf(stop(repo, home)), goOn)
})
