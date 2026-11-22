import assert from 'node:assert/strict'
import { mkdirSync, readdirSync, utimesSync } from 'node:fs'
import { join } from 'node:path'
import { test } from 'node:test'
import { notwice, tempDir, write } from './helpers.mjs'

const DAY_MS = 24 * 60 * 60 * 1000
const WRITING = [
  'Never use em dashes in anything written for the user.',
  'Use a comma, a colon, parentheses or a full stop instead.',
  'Grep every draft for the dash before calling it done.',
].join('\n')

function age(file, days) {
  const time = new Date(Date.now() - days * DAY_MS)
  utimesSync(file, time, time)
  return file
}

const encode = (path) => path.replace(/[/.]/g, '-')
const line = (record) => JSON.stringify(record)
const rule = (from) => `---\nkind: forbid\npattern: zzz\nfrom: ${from}\n---\nNo zzz.\n\n## Bad\nzzz\n\n## Good\nyyy\n`

function folder(config, cwd, { transcripts = [[line({ type: 'queue-operation' }), line({ type: 'user', cwd })]], memory = {} } = {}) {
  const dir = join(config, 'projects', encode(cwd))
  mkdirSync(join(dir, 'memory'), { recursive: true })
  transcripts.forEach((lines, i) => age(write(dir, `session-${9 - i}.jsonl`, `${lines.join('\n')}\n`), i))
  for (const [name, text] of Object.entries(memory)) write(dir, `memory/${name}`, text)
  return dir
}

function fixture() {
  const root = tempDir('notwice-memory-')
  const config = join(root, 'claude')
  const scratch = join(root, 'scratch')
  const home = join(root, 'home')
  const rulesHome = join(root, 'notwice-home')
  const repo = join(root, 'code', 'shop')
  mkdirSync(join(repo, '.git'), { recursive: true })
  mkdirSync(join(scratch, 'thread-a'), { recursive: true })
  mkdirSync(home, { recursive: true })
  write(repo, 'CLAUDE.md', 'Run yarn in this repo, never npm.\n')
  write(repo, 'AGENTS.md', 'Notes for other agents.\n')
  write(repo, '.claude/rules/shop.md', 'Keep functions short.\n')

  age(write(config, 'rules/writing.md', `${WRITING}\n`), 30)
  age(write(config, 'rules/web-only.md', '---\npaths: ["web/**"]\n---\nUse the design tokens.\n'), 90)
  write(config, 'CLAUDE.md.bak', 'An old global file.\n')

  folder(config, repo, {
    transcripts: [[line({ type: 'queue-operation' }), '{"type":"user","cwd":', line({ type: 'user', cwd: repo })], [line({ type: 'user', cwd: join(root, 'elsewhere') })]],
    memory: {
      'MEMORY.md': Array.from({ length: 250 }, (_, i) => `- [note ${i}](n.md)`).join('\n'),
      'deploy-steps.md': '---\nname: deploy-steps\n---\nEvery agent runs ~/gone/deploy.sh after /tmp/brief.md is ready. See [[missing-note]] and [[incidents]].\n',
      'incidents.md': 'Checked on 2026-01-02, 2026-02-03 and again in #101 and #102.\n',
      'copy-of-writing.md': `Release checklist for the shop app.\n${Array.from({ length: 30 }, (_, i) => `Step ${i}: check item ${i} before upload.`).join('\n')}\n${WRITING}\n`,
    },
  })
  folder(config, join(scratch, 'thread-a'), { memory: { 'MEMORY.md': '- [disk](disk-notes.md)\n', 'disk-notes.md': 'Keep the emulator.\n' } })
  folder(config, join(scratch, 'thread-gone'), { memory: { 'lost.md': 'A fact nobody loads.\n' } })
  folder(config, join(root, 'no-transcripts'), { transcripts: [], memory: { 'stray.md': 'Written once.\n' } })
  folder(config, join(root, 'empty-memory'))

  const worktree = join(root, 'code', 'shop-wt')
  write(worktree, '.git', `gitdir: ${repo}/.git/worktrees/shop-wt\n`)
  write(worktree, 'CLAUDE.md', 'Run yarn in this repo, never npm.\n')
  folder(config, worktree, { memory: { 'old.md': 'Worktree memory that never loads.\n' } })
  for (const clone of ['clone-a', 'clone-b']) {
    mkdirSync(join(root, 'code', clone, '.git'), { recursive: true })
    write(join(root, 'code', clone), 'AGENTS.md', 'The same research brief in every clone.\n')
    folder(config, join(root, 'code', clone))
  }

  write(rulesHome, 'rules/no-em-dash.md', rule('notes 2026-08-30 #12 (writing.md)'))
  write(rulesHome, 'proposed/deploy-gate.md', rule('shop 2026-11-01 (deploy-steps)'))
  write(rulesHome, 'proposed/shop-wide.md', rule('shop postmortem 2026-11-02'))
  const now = Date.now()
  write(rulesHome, 'log.jsonl', [
    { ts: new Date(now - DAY_MS).toISOString(), type: 'violation', rule: 'no-em-dash' },
    { ts: new Date(now - 2 * DAY_MS).toISOString(), type: 'violation', rule: 'no-em-dash' },
    { ts: new Date(now - 40 * DAY_MS).toISOString(), type: 'violation', rule: 'no-em-dash' },
    { ts: new Date(now - DAY_MS).toISOString(), type: 'violation', rule: 'other' },
  ].map(line).join('\n'))
  write(rulesHome, 'failures.jsonl', ['no-em-dash', 'no-em-dash', 'no-em-dash', 'other'].map((id) => line({ rule_or_check: id })).join('\n'))
  const env = { CLAUDE_CONFIG_DIR: config, NOTWICE_SCRATCH_DIR: scratch, HOME: home }
  return { root, config, repo, scratch, home, rulesHome, env, cwd: root }
}

function inventory(f, args = ['--json']) {
  const result = notwice(['memory', ...args], { home: f.rulesHome, env: f.env, cwd: f.cwd })
  assert.equal(result.code, 0, result.stderr)
  return args.includes('--json') ? JSON.parse(result.stdout) : result.stdout
}

const byId = (report) => Object.fromEntries(report.entries.map((e) => [e.id, e]))

function listTree(dir) {
  return readdirSync(dir, { recursive: true }).sort()
}

test('memory classifies scope and loading: global, project, thread and orphans', () => {
  const f = fixture()
  const entries = byId(inventory(f))
  const scopes = Object.fromEntries(Object.entries(entries).map(([id, e]) => [id, `${e.scope} ${e.loads}`]))
  assert.deepEqual(scopes, {
    'rules/writing.md': 'global always',
    'rules/web-only.md': 'global on-demand',
    'CLAUDE.md.bak': 'global never',
    'shop/MEMORY': 'project:shop always',
    'shop/deploy-steps': 'project:shop on-demand',
    'shop/incidents': 'project:shop on-demand',
    'shop/copy-of-writing': 'project:shop on-demand',
    'shop/CLAUDE.md': 'project:shop always',
    'shop/.claude/rules/shop.md': 'project:shop always',
    'shop/AGENTS.md': 'project:shop on-demand',
    'clone-a/AGENTS.md': 'project:clone-a always',
    'thread-a/MEMORY': 'thread always',
    'thread-a/disk-notes': 'thread on-demand',
    'thread-gone/lost': 'orphan never',
    [`${encode(join(f.root, 'no-transcripts'))}/stray`]: 'orphan never',
    'shop-wt/old': 'orphan never',
  })
  assert.match(entries['thread-gone/lost'].suggest[0], /^Rescue or delete .*lost\.md: no session loads it\.$/)
  assert.match(entries['thread-a/disk-notes'].suggest[0], /only one scratch thread loads it/)
  assert.match(entries['CLAUDE.md.bak'].suggest[0], /^Delete .*CLAUDE\.md\.bak: it never loads\.$/)
})

test('memory reads cwd from the newest transcript, past a first line without it', () => {
  const f = fixture()
  const odd = join(f.root, 'code', 'zażółć')
  mkdirSync(join(odd, '.git'), { recursive: true })
  write(odd, 'CLAUDE.md', 'Odd path.\n')
  const head = '{"type":"x","pad":"'
  const second = line({ type: 'user', cwd: odd })
  const splitAt = Buffer.byteLength(second.slice(0, second.indexOf('ż')))
  const pad = 64 * 1024 - 1 - splitAt - Buffer.byteLength(`${head}"}\n`)
  folder(f.config, odd, { transcripts: [[`${head}${'a'.repeat(pad)}"}`, second]] })
  const entries = byId(inventory(f))
  assert.equal(entries['shop/deploy-steps'].scope, 'project:shop')
  assert.equal(entries['zażółć/CLAUDE.md'].path, join(odd, 'CLAUDE.md'))
})

test('memory estimates tokens as bytes / 4 and counts only the first 200 lines or 25 KB of MEMORY.md', () => {
  const f = fixture()
  mkdirSync(join(f.scratch, 'thread-big'))
  folder(f.config, join(f.scratch, 'thread-big'), { memory: { 'MEMORY.md': `${'x'.repeat(299)}\n`.repeat(100) } })
  const entries = byId(inventory(f))
  assert.equal(entries['thread-big/MEMORY'].tokens, 25 * 1024 / 4)
  assert.equal(entries['rules/writing.md'].tokens, Math.round(Buffer.byteLength(`${WRITING}\n`) / 4))
  const loaded = Array.from({ length: 200 }, (_, i) => `- [note ${i}](n.md)`).join('\n')
  assert.equal(entries['shop/MEMORY'].tokens, Math.round(Buffer.byteLength(loaded) / 4))
})

test('memory adds always-on tokens per session on top of the global ones', () => {
  const report = inventory(fixture())
  const entries = byId(report)
  const tokens = (...ids) => ids.reduce((sum, id) => sum + entries[id].tokens, 0)
  assert.equal(report.alwaysOn.global, tokens('rules/writing.md'))
  assert.equal(report.alwaysOn['project:shop'], tokens('rules/writing.md', 'shop/MEMORY', 'shop/CLAUDE.md', 'shop/.claude/rules/shop.md'))
  assert.equal(report.alwaysOn['thread:thread-a'], tokens('rules/writing.md', 'thread-a/MEMORY'))
})

test('memory flags duplicates across files and folds identical project files into one row', () => {
  const entries = byId(inventory(fixture()))
  assert.ok(entries['shop/copy-of-writing'].flags.includes('dup:rules/writing.md'))
  assert.ok(entries['rules/writing.md'].flags.includes('dup:shop/copy-of-writing'))
  assert.match(entries['shop/copy-of-writing'].suggest.join('\n'), /^Delete .*copy-of-writing\.md: it repeats .*writing\.md\.$/m)
  assert.equal(entries['rules/writing.md'].suggest.length, 0)
  assert.equal(entries['clone-a/AGENTS.md'].copies, 1)
  assert.ok(entries['clone-a/AGENTS.md'].flags.includes('copies:1'))
  assert.equal(entries['clone-b/AGENTS.md'], undefined)
  assert.equal(entries['shop-wt/CLAUDE.md'], undefined)
})

test('memory flags stale, ephemeral and dangling references and hints at global facts', () => {
  const f = fixture()
  const steps = byId(inventory(f))['shop/deploy-steps']
  assert.deepEqual(steps.flags, ['stale:~/gone/deploy.sh', 'ephemeral:/tmp/brief.md', 'dangling:[[missing-note]]', 'global-fact'])
  assert.match(steps.suggest.join('\n'), /Promote .*deploy-steps\.md into .*rules if it applies to every project\./)
  assert.match(steps.suggest.join('\n'), /Fix .*deploy-steps\.md: ~\/gone\/deploy\.sh no longer exists\./)
  assert.match(steps.suggest.join('\n'), /Fix .*deploy-steps\.md: write the memory \[\[missing-note\]\] or drop the link\./)
  write(f.home, 'gone/deploy.sh', 'echo deploy\n')
  assert.ok(!byId(inventory(f))['shop/deploy-steps'].flags.includes('stale:~/gone/deploy.sh'))
})

test('memory names the active and proposed rules that back an entry, with their fires and failures', () => {
  const entries = byId(inventory(fixture()))
  const writing = entries['rules/writing.md']
  assert.deepEqual(writing.backed, [{ id: 'no-em-dash', state: 'rules' }])
  assert.equal(writing.fires, 2)
  assert.equal(writing.recur, 3)
  assert.equal(writing.recurApprox, false)
  assert.deepEqual(entries['shop/deploy-steps'].backed, [{ id: 'deploy-gate', state: 'proposed' }])
  assert.deepEqual(entries['shop/MEMORY'].backed, [])
  assert.deepEqual(entries['shop/CLAUDE.md'].backed, [])
  assert.deepEqual(entries['shop/.claude/rules/shop.md'].backed, [])
  const incidents = entries['shop/incidents']
  assert.deepEqual([incidents.backed, incidents.recur, incidents.recurApprox], [[], 4, true])
  assert.match(incidents.suggest.join('\n'), /^Enforce .*incidents\.md: it cites 4 incidents; ask the learn skill to draft a rule from it, then run notwice propose\.$/m)
})

test('memory ranks by score within each scope and shows the parts', () => {
  const report = inventory(fixture())
  const writing = byId(report)['rules/writing.md']
  assert.deepEqual(writing.parts, { recur: 6, fires: 3.2, scope: 2, recency: 0 })
  assert.equal(writing.score, 11.2)
  assert.deepEqual(byId(report)['rules/web-only.md'].parts, { recur: 0, fires: 0, scope: 2, recency: -1 })
  const kinds = report.entries.map((e) => e.scope.split(':')[0])
  assert.deepEqual([...new Set(kinds)], ['global', 'project', 'thread', 'orphan'])
  for (const kind of new Set(kinds)) {
    const scores = report.entries.filter((e) => e.scope.startsWith(kind)).map((e) => e.score)
    assert.deepEqual(scores, [...scores].sort((a, b) => b - a))
  }
  assert.equal(report.entries.find((e) => e.scope.startsWith('project')).id, 'shop/incidents')
})

test('memory lists nothing for a missing config dir or an empty memory folder', () => {
  const f = fixture()
  const missing = inventory({ ...f, env: { ...f.env, CLAUDE_CONFIG_DIR: join(f.root, 'nowhere') } })
  assert.deepEqual(missing.entries, [])
  assert.deepEqual(missing.alwaysOn, { global: 0 })
  const ids = byId(inventory(f))
  assert.ok(!Object.keys(ids).some((id) => id.startsWith('empty-memory')))
  assert.match(inventory({ ...f, env: { ...f.env, CLAUDE_CONFIG_DIR: join(f.root, 'nowhere') } }, []), /^0 files[\s\S]*No suggestions\.$/m)
})

test('memory --json has a stable shape, the text view has a table and suggestions, and nothing is written', () => {
  const f = fixture()
  const before = listTree(f.root)
  const report = inventory(f)
  assert.deepEqual(Object.keys(report), ['configDir', 'scratchDir', 'alwaysOn', 'entries'])
  assert.equal(report.configDir, f.config)
  const keys = ['id', 'path', 'scope', 'loads', 'tokens', 'age', 'copies', 'backed', 'fires', 'recurApprox', 'recur', 'flags', 'score', 'parts', 'suggest']
  for (const e of report.entries) assert.deepEqual(Object.keys(e), keys)
  const text = inventory(f, [])
  assert.match(text, /^score\s+id\s+scope\s+loads\s+~tok\s+age\s+backed\s+fires\s+recur\s+why\s+flags$/m)
  assert.match(text, /^11\.2\s+rules\/writing\.md\s+global\s+always\s+\d+\s+30d\s+no-em-dash\s+2\s+3\s+recur\+6 fires\+3\.2 scope\+2\s+dup:shop\/copy-of-writing$/m)
  assert.match(text, /deploy-gate\?/)
  assert.match(text, /^Always-on tokens in a new session: \d+ anywhere, \d+ in project:shop/m)
  assert.match(text, /^Suggestions:\n- /m)
  assert.match(text, /Nothing was changed\./)
  assert.deepEqual(listTree(f.root), before)
})
