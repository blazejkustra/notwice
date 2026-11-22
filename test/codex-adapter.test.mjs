import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { test } from 'node:test'
import { toEvent } from '../src/adapters/codex.mjs'
import { patchFiles } from '../src/adapters/patch.mjs'
import { EM_DASH, ROOT, hook, makeHome, makeRepo, notwice, tempDir, write } from './helpers.mjs'

const FIXTURES = join(ROOT, 'test', 'fixtures', 'payloads')
const TRANSCRIPT = join(FIXTURES, 'codex-transcript.jsonl')
const ATTRIBUTION_LINE = 'Co-Authored-By: Claude <noreply@anthropic.com>'

function payload(name, repo = '/repo') {
  const text = readFileSync(join(FIXTURES, 'codex.json'), 'utf8').replaceAll('$REPO', repo).replaceAll('$TRANSCRIPT', TRANSCRIPT)
  return JSON.parse(text)[name]
}

function codexHook(input, { home }) {
  const result = notwice(['hook', '--agent', 'codex'], { home, input: JSON.stringify(input), cwd: input.cwd })
  return result.stdout ? JSON.parse(result.stdout) : null
}

test('Codex payloads map to internal events, with exit codes read from the transcript', () => {
  const pre = toEvent(payload('preBash'))
  assert.deepEqual([pre.agent, pre.type, pre.session, pre.cwd, pre.shell.command], ['codex', 'shell.before', '01a202e6-0000-7000-8000-000000000001', '/repo', 'echo hello > out.txt && cat out.txt'])
  assert.deepEqual(pre.caps, { mainVsWorker: false })
  assert.deepEqual(toEvent(payload('postBashFailed')).shell, { command: 'npm test', background: false, exit: 1, output: 'npm error Test failed.\n' })
  assert.equal(toEvent(payload('postBashPassed')).shell.exit, 0)
  assert.equal(toEvent({ ...payload('postBashPassed'), tool_use_id: 'call_9' }).shell.exit, null)
  assert.equal(toEvent({ ...payload('postBashPassed'), transcript_path: null }).shell.exit, null)
  assert.deepEqual(toEvent(payload('prePatch')).edit.files, [{ path: 'src/a.js', added: [{ line: 1, text: "export const a = 'POSTBLOCK'" }] }])
  assert.deepEqual(toEvent(payload('postPatchFailed')).edit.files, [])
  const stop = toEvent(payload('stop'))
  assert.deepEqual([stop.type, stop.turn], ['turn.end', { reply: 'All done, tests pass.', retry: false, background: 0 }])
  assert.deepEqual(toEvent(payload('subagentStart')).sub, { id: '019a-sub', type: 'explorer' })
  assert.equal(toEvent(payload('sessionStart')).type, 'session.start')
})

test('V4A patches give added lines per file, with line numbers found in the file after the edit', () => {
  const repo = tempDir()
  write(repo, 'src/b.js', 'export const a = 1\nexport const b = 2\n')
  assert.deepEqual(toEvent(payload('postPatchAdd', repo)).edit.files, [{ path: 'src/b.js', added: [{ line: 1, text: 'export const a = 1' }, { line: 2, text: 'export const b = 2' }] }])
  write(repo, 'lib/new.js', 'const x = 1\nconst y = 3\n')
  const moved = ['*** Begin Patch', '*** Update File: old.js', '*** Move to: lib/new.js', '@@', ' const x = 1', '-const y = 2', '+const y = 3', '*** Delete File: gone.js', '*** End Patch'].join('\n')
  assert.deepEqual(patchFiles(moved, repo, true), [
    { path: 'old.js', added: [] },
    { path: 'lib/new.js', added: [{ line: 2, text: 'const y = 3' }] },
    { path: 'gone.js', added: [] },
  ])
  const reordered = ['*** Begin Patch', '*** Update File: a.js', '@@', '-const x = 1', '+const z = 0', '+const x = 1', '*** End Patch'].join('\n')
  assert.deepEqual(patchFiles(reordered, repo, false), [{ path: 'a.js', added: [{ line: 1, text: 'const z = 0' }] }])
})

test('Codex gets Claude-shaped denies, edit feedback and Stop continuations', () => {
  const home = makeHome()
  const repo = makeRepo()
  write(repo, 'package.json', '{"scripts":{"test":"node --test"}}\n')
  const session = { session_id: 'codex-s1', transcript_path: TRANSCRIPT, cwd: repo }
  codexHook({ ...payload('sessionStart', repo), ...session }, { home })
  const denied = codexHook({ ...payload('preBash', repo), ...session, tool_input: { command: `git commit -am "Fix" -m "${ATTRIBUTION_LINE}"` } }, { home })
  assert.equal(denied.hookSpecificOutput.permissionDecision, 'deny')
  assert.match(denied.hookSpecificOutput.permissionDecisionReason, /notwice blocked this command[\s\S]*no-claude-attribution/)
  const guard = codexHook({ ...payload('prePatch', repo), ...session, tool_input: { command: `*** Begin Patch\n*** Delete File: ${join(home, 'rules', 'no-em-dash.md')}\n*** End Patch` } }, { home })
  assert.match(guard.hookSpecificOutput.permissionDecisionReason, /active rules are off-limits/)
  write(repo, 'docs/pitch.md', `tidy ${EM_DASH} fast\n`)
  const patch = `*** Begin Patch\n*** Add File: docs/pitch.md\n+tidy ${EM_DASH} fast\n*** End Patch\n`
  const feedback = codexHook({ ...payload('postPatchAdd', repo), ...session, tool_input: { command: patch } }, { home })
  assert.equal(feedback.decision, 'block')
  assert.match(feedback.reason, /docs\/pitch\.md:1 \[no-em-dash\]/)
  write(repo, 'docs/pitch.md', 'tidy is fast\n')
  write(repo, 'src/sum.ts', 'export const sum = 1\n')
  const sumPatch = '*** Begin Patch\n*** Add File: src/sum.ts\n+export const sum = 1\n*** End Patch\n'
  codexHook({ ...payload('postPatchAdd', repo), ...session, tool_input: { command: sumPatch } }, { home })
  codexHook({ ...payload('postBashFailed', repo), ...session }, { home })
  const stop = codexHook({ ...payload('stop', repo), ...session }, { home })
  assert.equal(stop.decision, 'block')
  assert.match(stop.reason, /You said "tests pass", but no check passed after your last edit \(src\/sum\.ts\)/)
  assert.equal(codexHook({ ...payload('stop', repo), ...session, stop_hook_active: true }, { home }), null)
  codexHook({ ...payload('postBashPassed', repo), ...session }, { home })
  assert.equal(codexHook({ ...payload('stop', repo), ...session }, { home }), null)
})

test('in: main rules stay off on Codex, which cannot tell a subagent from the main session', () => {
  const home = makeHome()
  const repo = makeRepo()
  const watch = { tool_input: { command: 'gh pr checks 12 --watch' }, cwd: repo }
  assert.equal(codexHook({ ...payload('preBash', repo), ...watch }, { home }), null)
  const claude = hook({ hook_event_name: 'PreToolUse', tool_name: 'Bash', ...watch }, { home })
  assert.equal(claude.output.hookSpecificOutput.permissionDecision, 'deny')
})

test('Codex session context stays under its hook output limit', () => {
  const home = makeHome()
  for (let i = 0; i < 80; i++) write(home, `proposed/long-${i}.md`, `---\nkind: forbid\npattern: 'zz${i}zz'\n---\n${'Keep this rule in mind. '.repeat(8)}\n\n## Bad\nzz${i}zz\n\n## Good\nok\n`)
  notwice(['approve', ...Array.from({ length: 80 }, (_, i) => `long-${i}`)], { home })
  const context = codexHook(payload('sessionStart', makeRepo()), { home }).hookSpecificOutput.additionalContext
  assert.ok(context.length <= 4000, String(context.length))
  assert.match(context, /\nnotwice enforces \d+ more rules with hooks; notwice list shows them all\. Every block message explains the rule it applies\.$/)
})

test('notwice agents lists Codex sessions and their subagents', () => {
  const home = makeHome()
  const repo = makeRepo()
  const start = payload('sessionStart', repo)
  codexHook(start, { home })
  codexHook({ ...payload('subagentStart', repo), session_id: start.session_id }, { home })
  const lines = notwice(['agents'], { home }).stdout.trimEnd().split('\n')
  assert.match(lines[1], /^└ 01a20304 {2}codex {2}working/)
  assert.match(lines[2], /^ {2}└ 019a-sub {2}explorer {2}running/)
})
