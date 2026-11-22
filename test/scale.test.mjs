import assert from 'node:assert/strict'
import { copyFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { test } from 'node:test'
import { checkCommand, checkLines, checkText } from '../src/core/check.mjs'
import { DAY_MS, loadRules } from '../src/core/store.mjs'
import { EM_DASH, FIXTURE_RULES, ROOT, hook, makeRepo, tempDir, write } from './helpers.mjs'

const SHAPES = [
  (n) => ({ pattern: `\\bfoo${n}\\b`, bad: `x = foo${n} + 1`, good: `x = foo${n}x` }),
  (n) => ({ pattern: `console\\.dbg${n}\\(`, bad: `console.dbg${n}("x")`, good: `console.dbg${n}` }),
  (n) => ({ pattern: `colou?r${n}`, bad: `color${n}`, good: `colr${n}` }),
  (n) => ({ pattern: `todo${n}|fixme${n}`, flags: 'i', bad: `// FIXME${n} later`, good: '// done' }),
  (n) => ({ pattern: `(?:get|set)Value${n}\\(`, bad: `setValue${n}(1)`, good: `value${n}(1)` }),
  (n) => ({ pattern: `[A-Z]{2,}_KEY${n}=`, bad: `AB_KEY${n}=x`, good: `ab_KEY${n}=x` }),
  (n) => ({ pattern: `\\u2014${n}`, bad: `a ${EM_DASH}${n} b`, good: `a - ${n} b`, paths: ['*.md'] }),
  (n) => ({ pattern: `\\x41PI${n}`, bad: `API${n}`, good: `api${n}` }),
  (n) => ({ pattern: `(?<![\\w$])eval${n}\\s*\\(`, bad: `eval${n} (x)`, good: `my_eval${n}(x)`, paths: ['*.ts'] }),
  (n) => ({ pattern: `ab+c${n}`, bad: `abbbc${n}`, good: `ac${n}` }),
  (n) => ({ pattern: `x{2}y${n}z`, bad: `xxy${n}z`, good: `xy${n}z` }),
  (n) => ({ pattern: `(["'])key${n}\\1`, bad: `"key${n}"`, good: `"key${n}'` }),
  (n) => ({ pattern: `\\tindent${n}`, bad: `\tindent${n}`, good: ` indent${n}` }),
  (n) => ({ pattern: `SELECT \\* FROM t${n}\\b`, flags: 'i', bad: `select * from t${n}`, good: `select a from t${n}` }),
  (n) => ({ pattern: `^import .* from 'pkg${n}'$`, bad: `import x from 'pkg${n}'`, good: `import x from 'pkg${n}x'` }),
  (n) => ({ pattern: `\\$\\{secret${n}\\}`, bad: `\${secret${n}}`, good: `$secret${n}` }),
  (n) => ({ pattern: `api.key${n}`, bad: `api_key${n}`, good: `apikey${n}` }),
  (n) => ({ pattern: `café${n}`, flags: 'i', bad: `CAFÉ${n}`, good: `cafe${n}` }),
  (n) => ({ pattern: `σοφία${n}`, flags: 'i', bad: `ΣΟΦΊΑ${n}`, good: `sofia${n}` }),
  (n) => ({ pattern: `^\\s*#{3,}\\s*$|\\d{4}-x${n}`, bad: `2026-x${n}`, good: `26-x${n}` }),
]

const quoted = (text) => `'${text.replaceAll("'", "''")}'`

function ruleFile({ pattern, flags, paths, pin, bad, good }, id) {
  const meta = [`kind: forbid`, `pattern: ${quoted(pattern)}`, flags && `flags: ${flags}`, paths && `paths: [${paths.map(quoted).join(', ')}]`, pin && 'pin: true']
  const text = `Rule ${id}. Keep the code consistent with the conventions of the team.`
  return `---\n${meta.filter(Boolean).join('\n')}\n---\n${text}\n\n## Bad\n\`\`\`\n${bad}\n\`\`\`\n\n## Good\n\`\`\`\n${good}\n\`\`\`\n`
}

function scaleHome(count) {
  const home = tempDir('notwice-scale-')
  const shapes = Array.from({ length: count }, (_, n) => SHAPES[n % SHAPES.length](n))
  shapes.forEach((shape, n) => write(home, `rules/r${n}.md`, ruleFile(shape, `r${n}`)))
  return { home, shapes }
}

function withHome(home, fn) {
  const saved = process.env.NOTWICE_HOME
  process.env.NOTWICE_HOME = home
  try {
    return fn()
  } finally {
    process.env.NOTWICE_HOME = saved
  }
}

const linesIn = (file, texts) => texts.map((text, i) => ({ file, line: i + 1, text }))
const retarget = (rules, target) => rules.map((r) => ({ ...r, targets: [target] }))

function checkAll(rules, shapes) {
  const texts = shapes.flatMap((s) => [s.bad, s.good])
  const lines = [...linesIn('src/a.ts', texts), ...linesIn('docs/a.md', texts), ...linesIn('dist/a.js', texts.slice(0, 100))]
  return {
    files: checkLines(rules, lines, 'files'),
    commits: checkText(retarget(rules, 'commits'), texts.slice(0, 400).join('\n'), 'commits', 'commit'),
    commands: texts.slice(0, 100).map((text) => checkCommand(retarget(rules, 'commands'), text)),
  }
}

test('1,000 rules give the same matches through the index and prefilter as a plain scan', () => {
  const { home, shapes } = scaleHome(1000)
  const plain = withHome(home, () => loadRules(null)).map((r) => ({ ...r, needles: null }))
  const index = join(home, 'rules', '.index.json')
  const built = statSync(index).mtimeMs
  const indexed = withHome(home, () => loadRules(null))
  assert.equal(statSync(index).mtimeMs, built)
  assert.ok(indexed.filter((r) => r.needles).length >= 900)
  const fast = checkAll(indexed, shapes)
  assert.deepEqual(fast, checkAll(plain, shapes))
  const fired = new Set(fast.files.violations.map((v) => v.id))
  assert.equal(fired.size, 1000)
  assert.ok(fast.files.violations.every((v) => !v.where.startsWith('dist/')))
})

test('the index follows edits to a rule file', () => {
  const { home } = scaleHome(3)
  const line = [{ file: 'src/a.ts', line: 1, text: 'x = foo0 + bar' }]
  assert.equal(checkLines(withHome(home, () => loadRules(null)), line, 'files').violations.length, 1)
  write(home, 'rules/r0.md', ruleFile({ pattern: '\\bbar\\b', bad: 'bar', good: 'baz' }, 'r0').replace('Rule r0.', 'Rule r0, now about bar.'))
  const after = checkLines(withHome(home, () => loadRules(null)), line, 'files')
  assert.deepEqual(after.violations.map((v) => v.excerpt), ['x = foo0 + bar'])
  assert.match(after.violations[0].text, /now about bar/)
})

function contextHome() {
  const { home } = scaleHome(1000)
  write(home, 'rules/pinned.md', ruleFile({ pattern: 'zzpin', pin: true, bad: 'zzpin', good: 'ok' }, 'pinned'))
  copyFileSync(join(ROOT, 'starter', 'tests-after-code.md'), join(home, 'rules', 'tests-after-code.md'))
  copyFileSync(join(FIXTURE_RULES, 'pr-sections.md'), join(home, 'rules', 'pr-sections.md'))
  const fire = (rule, days) => JSON.stringify({ ts: new Date(Date.now() - days * DAY_MS).toISOString(), type: 'violation', rule })
  write(home, 'log.jsonl', `${fire('r999', 1)}\n${fire('r998', 40)}\n`)
  return home
}

const listed = (context) => [...context.matchAll(/^- ([\w-]+)/gm)].map((m) => m[1])
const contextOf = (output) => output?.hookSpecificOutput.additionalContext

test('at 1,000 rules the session context stays capped and deterministic, with pinned, workflow, recent and repo rules first', () => {
  const home = contextHome()
  const repo = makeRepo()
  const start = (session_id) => contextOf(hook({ hook_event_name: 'SessionStart', source: 'startup', cwd: repo, session_id }, { home }).output)
  const context = start('s-a')
  assert.ok(context.length <= 4000, String(context.length))
  assert.equal(start('s-b'), context)
  const ids = listed(context)
  assert.deepEqual(ids.slice(0, 5), ['human-approval', 'pinned', 'pr-sections', 'tests-after-code', 'r999'])
  const forFiles = (glob) => ids.filter((id) => /^r\d+$/.test(id) && SHAPES[Number(id.slice(1)) % SHAPES.length](0).paths?.[0] === glob)
  assert.deepEqual(forFiles('*.md'), ids.slice(5))
  assert.ok(ids.length > 30, String(ids.length))
  assert.ok(!ids.includes('r998'))
  assert.match(context, new RegExp(`\\nnotwice enforces ${1004 - ids.length} more rules with hooks; notwice list shows them all\\. Every block message explains the rule it applies\\.$`))
  const sub = contextOf(hook({ hook_event_name: 'SubagentStart', cwd: repo, session_id: 's-a', agent_id: 'sub1', agent_type: 'Explore' }, { home }).output)
  assert.ok(sub.length <= 4000, String(sub.length))
})

test('the first touch of a file adds its path rules that the agent has not seen yet, once and within a small cap', () => {
  const home = contextHome()
  const repo = makeRepo()
  const session = listed(contextOf(hook({ hook_event_name: 'SessionStart', source: 'startup', cwd: repo, session_id: 's-jit' }, { home }).output))
  const touch = (tool, file, extra = {}) =>
    contextOf(hook({ hook_event_name: 'PreToolUse', tool_name: tool, cwd: repo, session_id: 's-jit', tool_input: { file_path: join(repo, file), content: 'x' }, ...extra }, { home }).output)
  const first = touch('Read', 'src/a.ts')
  assert.match(first, /^notwice rules for src\/a\.ts:\n- r108: Rule r108\./)
  assert.ok(first.length <= 1600, String(first.length))
  assert.equal(touch('Read', 'src/a.ts'), undefined)
  assert.equal(touch('Write', 'src/b.ts'), undefined)
  const readme = listed(touch('Read', 'README.md'))
  assert.ok(readme.length && readme.every((id) => !session.includes(id)), readme.join(' '))
  assert.equal(touch('Edit', 'docs/guide.md'), undefined)
  assert.match(touch('Read', 'src/a.ts', { agent_id: 'sub1', agent_type: 'Explore' }), /^notwice rules for src\/a\.ts:/)
})

test('after a compaction, the first touch of a file shows its path rules again', () => {
  const home = contextHome()
  const repo = makeRepo()
  const start = (source) => hook({ hook_event_name: 'SessionStart', source, cwd: repo, session_id: 's-compact' }, { home })
  const read = () => contextOf(hook({ hook_event_name: 'PreToolUse', tool_name: 'Read', cwd: repo, session_id: 's-compact', tool_input: { file_path: join(repo, 'src/a.ts') } }, { home }).output)
  start('startup')
  const first = read()
  assert.match(first, /^notwice rules for src\/a\.ts:/)
  assert.equal(read(), undefined)
  start('compact')
  assert.equal(read(), first)
})
