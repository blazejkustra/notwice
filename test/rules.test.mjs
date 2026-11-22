import assert from 'node:assert/strict'
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { test } from 'node:test'
import { checkLines, prove } from '../src/core/check.mjs'
import { globToRegExp, parseRule } from '../src/core/rules.mjs'
import { loadDir } from '../src/core/store.mjs'
import { FIXTURE_RULES, ROOT, tempDir, write } from './helpers.mjs'

const rule = (frontmatter, body = 'One line.\n\n## Bad\nx\n\n## Good\ny\n') => parseRule(`---\n${frontmatter}\n---\n${body}`, 'a.md')

test('parses flat frontmatter with lists, quotes and comments', () => {
  const r = rule("id: a\nkind: forbid   # forbid | require\npattern: 'it''s \\d'\ntargets: [files, \"pr\"]\nseverity: warn")
  assert.equal(r.kind, 'forbid')
  assert.equal(r.patterns[0].source, "it's \\d")
  assert.deepEqual(r.targets, ['files', 'pr'])
  assert.equal(r.severity, 'warn')
  assert.equal(r.text, 'One line.')
})

test('keeps commas inside quoted list items', () => {
  const r = rule("id: a\nkind: require\npattern: ['a{0,3}', \"b,c\"]\ntargets: [pr]")
  assert.deepEqual(r.patterns.map((p) => p.source), ['a{0,3}', 'b,c'])
})

test('defaults: files target, block severity, max 300, multiline flag, no stateful flags', () => {
  const r = rule("id: a\nkind: forbid\npattern: x\nflags: gi")
  assert.deepEqual(r.targets, ['files'])
  assert.equal(r.severity, 'block')
  assert.equal(r.max, 300)
  assert.equal(r.patterns[0].flags, 'im')
  assert.deepEqual(rule('id: s\nkind: max-added-lines').targets, ['pr'])
  assert.deepEqual(rule("kind: require\npattern: x").targets, ['pr'])
})

test('reads Bad and Good from fenced blocks, ignoring prose and headings inside fences', () => {
  const body = 'Text line.\n\n## Bad\nFrom PR #1:\n````\n## Summary\nhello\n````\n\n## Good\n```\n## Problem\n```\n'
  const r = rule("id: a\nkind: require\npattern: ['^## Problem']\ntargets: [pr]", body)
  assert.equal(r.bad, '## Summary\nhello')
  assert.equal(r.good, '## Problem')
})

test('rejects broken rules with a clear message', () => {
  assert.throws(() => parseRule('no frontmatter', 'a.md'), /missing frontmatter/)
  assert.throws(() => rule('kind: forbid\npattern: x\nseverity: loud'), /severity must be block or warn/)
  assert.throws(() => rule('id: a\nkind: lint\npattern: x'), /kind must be one of/)
  assert.throws(() => rule('id: a\nkind: forbid'), /missing pattern/)
  assert.throws(() => rule('id: a\nkind: forbid\npattern: x\ntargets: [files, slack]'), /unknown target slack/)
  assert.throws(() => rule("id: a\nkind: forbid\npattern: '('"), /Invalid regular expression/)
})

test('globs match basenames anywhere and paths from the root', () => {
  assert.ok(globToRegExp('*.lock').test('a/b/yarn.lock'))
  assert.ok(!globToRegExp('*.ts').test('a/b.tsx'))
  assert.ok(globToRegExp('**/dist/**').test('pkg/dist/index.js'))
  assert.ok(globToRegExp('src/*.js').test('src/a.js'))
  assert.ok(!globToRegExp('src/*.js').test('lib/src/a.js'))
})

test('loadDir returns parse errors next to good rules', () => {
  const dir = tempDir()
  write(dir, 'good.md', '---\nkind: forbid\npattern: x\n---\nText\n')
  write(dir, 'bad.md', '---\nkind: nope\n---\n')
  write(dir, 'notes.txt', 'ignored')
  const entries = loadDir(dir)
  assert.equal(entries.length, 2)
  assert.ok(entries.find((e) => e.rule?.id === 'good'))
  assert.match(entries.find((e) => e.error).error.message, /kind must be one of/)
  assert.deepEqual(loadDir(join(dir, 'missing')), [])
})

test('every starter, example, fixture and built-in rule proves itself and takes its id from the file name', () => {
  for (const dir of [join(ROOT, 'starter'), join(ROOT, 'examples', 'rules'), FIXTURE_RULES, join(ROOT, 'builtin')]) {
    for (const name of readdirSync(dir).filter((n) => n.endsWith('.md'))) {
      const r = parseRule(readFileSync(join(dir, name), 'utf8'), join(dir, name))
      assert.equal(`${r.id}.md`, name)
      assert.deepEqual(prove(r), [], `${name} should prove`)
    }
  }
})

test('the em dash fixture rule skips placeholders and mentions but catches prose', () => {
  const r = parseRule(readFileSync(join(FIXTURE_RULES, 'no-em-dash.md'), 'utf8'), 'no-em-dash.md')
  const fires = (text) => checkLines([r], [{ file: 'a.md', line: 1, text }], 'files').violations.length > 0
  assert.ok(fires('Fast setup \u2014 no config'))
  assert.ok(!fires('const empty = "\u2014"'))
  assert.ok(!fires('| Two device sets | \u2014 | Both |'))
  assert.ok(!fires('Never use em dashes (\u2014) as punctuation.'))
  assert.ok(!fires('textAvoids("copy", /\u2014/)'))
})
