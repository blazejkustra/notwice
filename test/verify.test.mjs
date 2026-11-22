import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { test } from 'node:test'
import { checkVerify, prove } from '../src/core/check.mjs'
import { testCommand } from '../src/core/manifest.mjs'
import { statusText } from '../src/core/command.mjs'
import { parseRule } from '../src/core/rules.mjs'
import { STARTER_DIR } from '../src/core/store.mjs'
import { commit, hook, makeHome, makeRepo, notwice, tempDir, write } from './helpers.mjs'

const starter = parseRule(readFileSync(join(STARTER_DIR, 'tests-after-code.md'), 'utf8'), 'tests-after-code.md')
const unmet = (events, reply) => checkVerify([starter], events, reply).violations.map((v) => v.excerpt)
const fenced = (lines) => `\`\`\`\n${lines.join('\n')}\n\`\`\``
const verifyRule = (frontmatter, bad, good) => `---\nkind: verify\n${frontmatter}\n---\nCheck it.\n\n## Bad\n${fenced(bad)}\n\n## Good\n${fenced(good)}\n`
const DEVICE_RULE = verifyRule(
  "when: ['*.tsx']\nrun: '^mcp__emulator__(?:screenshot|describe)$'",
  ['edit src/App.tsx', 'run mcp__emulator__list-devices'],
  ['edit src/App.tsx', 'run mcp__emulator__screenshot'],
)

function setup({ manifest = true } = {}) {
  const home = makeHome()
  const repo = makeRepo()
  if (manifest) commit(repo, { 'package.json': '{"scripts":{"test":"node --test"}}\n' }, 'Add package.json')
  hook({ hook_event_name: 'SessionStart', source: 'startup', cwd: repo }, { home })
  return { home, repo }
}

function edit({ home, repo }, file) {
  const content = 'export const x = 1\n'
  const tool_input = { file_path: write(repo, file, content), content }
  return hook({ hook_event_name: 'PostToolUse', tool_name: 'Write', cwd: repo, tool_input, tool_response: { type: 'create', structuredPatch: [] } }, { home })
}

const ran = ({ home, repo }, command, extra = {}) => hook({
  hook_event_name: 'PostToolUse', tool_name: 'Bash', cwd: repo,
  tool_input: { command, ...extra.input }, tool_response: { stdout: '', stderr: '', interrupted: false, ...extra.response },
}, { home })
const failed = ({ home, repo }, command) =>
  hook({ hook_event_name: 'PostToolUseFailure', tool_name: 'Bash', cwd: repo, tool_input: { command }, error: 'Exit code 1', is_interrupt: false }, { home })
const mcp = ({ home, repo }, tool) => hook({ hook_event_name: 'PostToolUse', tool_name: tool, cwd: repo, tool_input: {}, tool_response: [{ type: 'text', text: 'ok' }] }, { home })
const stop = ({ home, repo }, extra = {}) => hook({ hook_event_name: 'Stop', cwd: repo, stop_hook_active: false, ...extra }, { home })
const blockOf = (r) => (r.output?.decision === 'block' ? r.output.reason : null)

test('a verify rule names the files that trigger it, the runs that count and the claims to check', () => {
  assert.equal(starter.kind, 'verify')
  assert.ok(starter.when.some((re) => re.test('src/cart.ts')))
  assert.ok(!starter.when.some((re) => re.test('docs/guide.md')))
  assert.ok(starter.claims.test('Done, all tests pass.'))
  assert.throws(() => parseRule("---\nkind: verify\nrun: 'npm test'\n---\nText\n", 'a.md'), /verify rules need when and run/)
  assert.throws(() => parseRule("---\nkind: verify\nwhen: ['*.ts']\n---\nText\n", 'a.md'), /verify rules need when and run/)
})

test('the proof replays a session: Bad must leave the rule unmet, Good must meet it', () => {
  assert.deepEqual(prove(starter), [])
  assert.deepEqual(prove(parseRule(DEVICE_RULE, 'device-check.md')), [])
  const backwards = verifyRule("when: ['*.ts']\nrun: 'npm test'", ['edit a.ts', 'run npm test'], ['edit a.ts', 'run npm test | tail -5'])
  assert.deepEqual(prove(parseRule(backwards, 'backwards.md')), ['the Bad example does not trigger it', 'the Good example triggers it'])
})

test('only a run after the last code edit counts', () => {
  assert.deepEqual(unmet([{ edit: 'src/a.ts' }, { run: 'npm test' }]), [])
  const [excerpt] = unmet([{ run: 'npm test' }, { edit: 'src/a.ts' }])
  assert.match(excerpt, /^src\/a\.ts changed and no check passed after that\. Run one on its own, for example: npm test\. A piped/)
})

test('docs-only and generated changes never trigger a code rule', () => {
  assert.deepEqual(unmet([{ edit: 'README.md' }, { edit: 'docs/guide.md' }, { edit: 'dist/index.js' }]), [])
  assert.deepEqual(unmet([{ edit: 'src/a.ts' }, { run: 'npm test' }, { edit: 'CHANGELOG.md' }]), [])
})

test('a claim needs a passing run after the last edit, even after the gate gave up once', () => {
  const events = [{ edit: 'src/a.ts' }, { run: 'npm test' }, { edit: 'src/a.ts' }, { waived: 'tests-after-code' }]
  assert.deepEqual(unmet(events, 'Updated it.'), [])
  assert.match(unmet(events, 'Done, tested and working.')[0], /^You said "tested and working", but no check passed after your last edit \(src\/a\.ts\)\. Run one on its own/)
  assert.match(unmet([], 'All tests pass.')[0], /no check passed in this session\./)
  assert.deepEqual(unmet([{ edit: 'src/a.ts' }, { run: 'npm test' }], 'All tests pass.'), [])
  assert.deepEqual(unmet([], 'I have not run the tests yet.'), [])
})

test('a run counts only when its exit code is the command\'s: nothing piped, ||, ; or & after it', () => {
  for (const command of ['npm test', 'cd app && npm test', 'npm test && echo ok', 'npm test 2>&1', '(cd app && npm test)', 'set -o pipefail && npm test | tail -5']) {
    assert.match(statusText(command), /npm test/, command)
  }
  for (const command of ['npm test | tail -5', 'npm test || true', 'npm test; echo done', 'npm test &', 'npm test\necho done']) {
    assert.doesNotMatch(statusText(command), /npm test/, command)
  }
})

test('quoted text, heredoc bodies and substitutions that mention a check never count as running it', () => {
  const quoted = [
    'gh pr create --title "Add clamp" --body "`npm test` passes"',
    "git commit -m 'Fix slug; npm test passes'",
    "git commit -F - <<'EOF'\nFix slug\n\nnpm test passes\nEOF",
    'echo "run npm test before merging"',
    'echo $(npm test)',
    'git commit -m "set -o pipefail" && npm test | tail -5',
  ]
  for (const command of quoted) assert.doesNotMatch(statusText(command), /npm test/, command)
  for (const command of ['CI=1 npm test', 'npm test -- --grep "cart total"', 'xcodebuild -scheme "My App" test']) {
    assert.ok(starter.patterns.some((re) => re.test(statusText(command))), command)
  }
  const session = setup()
  edit(session, 'src/sum.ts')
  ran(session, quoted[0])
  assert.match(blockOf(stop(session)), /tests-after-code/)
})

test('Stop blocks code changed without a passing check, naming the rule, the file and an example command', () => {
  const session = setup()
  edit(session, 'src/sum.ts')
  const reason = blockOf(stop(session))
  assert.match(reason, /- verify \[tests-after-code\] After code changes, run tests/)
  assert.match(reason, /src\/sum\.ts changed and no check passed after that\. Run one on its own, for example: npm test\./)
  ran(session, 'npm test')
  assert.equal(stop(session).output, null)
})

test('a run before the last edit does not count', () => {
  const session = setup()
  edit(session, 'src/sum.ts')
  ran(session, 'npm test')
  edit(session, 'src/sum.ts')
  assert.match(blockOf(stop(session)), /tests-after-code/)
})

test('failed, piped, interrupted and background runs do not count', () => {
  const session = setup()
  edit(session, 'src/sum.ts')
  failed(session, 'npm test')
  ran(session, 'npm test 2>&1 | tail -5')
  ran(session, 'npm test || true')
  ran(session, 'npm test', { input: { run_in_background: true }, response: { backgroundTaskId: 'b1' } })
  ran(session, 'npm test', { response: { interrupted: true } })
  assert.match(blockOf(stop(session)), /tests-after-code/)
  ran(session, 'npm test && echo ok')
  assert.equal(stop(session).output, null)
})

test('a docs-only change never triggers the code rule', () => {
  const session = setup()
  edit(session, 'README.md')
  edit(session, 'docs/guide.md')
  assert.equal(stop(session).output, null)
})

test('a claim with no passing run is blocked and quoted back', () => {
  const session = setup()
  const reason = blockOf(stop(session, { last_assistant_message: 'Fixed the slug bug. Tested and working.' }))
  assert.match(reason, /You said "Tested and working", but no check passed in this session\. Run one on its own, for example: npm test\./)
  ran(session, 'npm test')
  assert.equal(stop(session, { last_assistant_message: 'Tested and working.' }).output, null)
})

test('MCP tool names count as evidence', () => {
  const session = setup()
  write(session.home, 'proposed/device-check.md', DEVICE_RULE)
  assert.equal(notwice(['approve', 'device-check'], { home: session.home }).code, 0)
  edit(session, 'src/App.tsx')
  ran(session, 'npm test')
  mcp(session, 'mcp__emulator__list-devices')
  const reason = blockOf(stop(session))
  assert.match(reason, /\[device-check\][\s\S]*for example: mcp__emulator__screenshot/)
  assert.doesNotMatch(reason, /tests-after-code/)
  mcp(session, 'mcp__emulator__screenshot')
  assert.equal(stop(session).output, null)
})

test('Stop blocks once per turn, then records the failure and stops asking about that edit', () => {
  const session = setup()
  edit(session, 'src/sum.ts')
  assert.ok(blockOf(stop(session)))
  assert.equal(stop(session, { stop_hook_active: true }).output, null)
  const record = JSON.parse(readFileSync(join(session.home, 'failures.jsonl'), 'utf8').trim().split('\n').at(-1))
  assert.equal(record.rule_or_check, 'tests-after-code')
  assert.equal(stop(session).output, null)
  assert.match(blockOf(stop(session, { last_assistant_message: 'All tests pass.' })), /You said "All tests pass"/)
  edit(session, 'src/sum.ts')
  assert.match(blockOf(stop(session)), /src\/sum\.ts changed/)
})

test('code changed through Bash counts as changed', () => {
  const session = setup()
  write(session.repo, 'src/generated-by-sed.ts', 'export const y = 2\n')
  assert.match(blockOf(stop(session)), /src\/generated-by-sed\.ts changed/)
  ran(session, 'npx tsc --noEmit')
  assert.equal(stop(session).output, null)
})

test('tests-after-code stays quiet in a repo without a test command, and its hint names the repo\'s command in full', () => {
  const quiet = setup({ manifest: false })
  edit(quiet, 'src/app.js')
  assert.equal(blockOf(stop(quiet)), null)
  const cargo = setup({ manifest: false })
  commit(cargo.repo, { 'Cargo.toml': '[package]\nname = "x"\n' }, 'Add Cargo.toml')
  edit(cargo, 'src/main.rs')
  const reason = blockOf(stop(cargo))
  assert.match(reason, /for example: cargo test\./)
  assert.match(reason, /If it cannot pass, tell the user\.$/m)
})

test('the test command comes from the nearest manifest above the edited file', () => {
  const command = (files, edited) => {
    const dir = tempDir()
    for (const [file, text] of Object.entries(files)) write(dir, file, text)
    return testCommand(dir, edited)
  }
  assert.equal(command({ 'README.md': 'x' }, 'src/a.js'), null)
  assert.equal(command({ 'package.json': '{"scripts":{"test":"echo \\"Error: no test specified\\" && exit 1"}}' }, 'a.js'), null)
  assert.equal(command({ 'package.json': '{"scripts":{"test":"vitest"}}', 'pnpm-lock.yaml': '' }, 'src/a.ts'), 'pnpm test')
  assert.equal(command({ 'package.json': '{"scripts":{"typecheck":"tsc"}}' }, 'a.ts'), 'npm run typecheck')
  assert.equal(command({ 'go.mod': 'module x', 'app/package.json': '{"scripts":{"test":"jest"}}' }, 'app/src/a.ts'), 'npm test')
  assert.equal(command({ 'go.mod': 'module x', 'app/package.json': '{}' }, 'app/src/a.ts'), 'go test ./...')
  assert.equal(command({ 'pyproject.toml': '' }, 'pkg/a.py'), 'python -m pytest')
  assert.equal(command({ 'Package.swift': '' }, 'Sources/a.swift'), 'swift test')
  assert.equal(command({ 'gradlew': '' }, 'app/a.kt'), './gradlew test')
  assert.equal(command({ 'App.xcodeproj/project.pbxproj': '' }, 'App/a.swift'), 'xcodebuild test -scheme App')
})
