import assert from 'node:assert/strict'
import { test } from 'node:test'
import { checkCommand, checkLines, checkSize, checkText, isIgnored, prove } from '../src/core/check.mjs'
import { parseNumstat } from '../src/core/git.mjs'
import { parseRule } from '../src/core/rules.mjs'
import { EM_DASH } from './helpers.mjs'

const rule = (frontmatter, bad = 'x', good = 'y') => {
  const [, id, rest] = frontmatter.match(/^id: (\S+)\n([\s\S]*)$/)
  return parseRule(`---\n${rest}\n---\nThe rule text.\n\n## Bad\n\`\`\`\n${bad}\n\`\`\`\n\n## Good\n\`\`\`\n${good}\n\`\`\`\n`, `${id}.md`)
}

const dash = rule(`id: no-em-dash\nkind: forbid\npattern: '${EM_DASH}'\ntargets: [files, commits, pr]`, `a ${EM_DASH} b`, 'a, b')
const line = (text, file = 'src/copy.md') => ({ file, line: 3, text })

test('forbid fires on added lines with file and line', () => {
  const { violations, overrides } = checkLines([dash], [line(`Fast ${EM_DASH} simple`), line('fine')], 'files')
  assert.equal(violations.length, 1)
  assert.equal(violations[0].where, 'src/copy.md:3')
  assert.equal(violations[0].severity, 'block')
  assert.equal(overrides.length, 0)
})

test('notwice-allow on the line turns a violation into a logged override', () => {
  const { violations, overrides } = checkLines([dash], [line(`const sep = '${EM_DASH}' // notwice-allow no-em-dash`)], 'files')
  assert.equal(violations.length, 0)
  assert.equal(overrides.length, 1)
})

test('an allow marker for another rule does not exempt the line', () => {
  const { violations } = checkLines([dash], [line(`x ${EM_DASH} y notwice-allow other-rule`)], 'files')
  assert.equal(violations.length, 1)
})

test('lockfiles, snapshots, generated files and .notwice rule files are ignored', () => {
  for (const file of ['yarn.lock', 'package-lock.json', 'a/__snapshots__/x.snap', 'web/dist/app.js', 'x.min.js', '.notwice/rules/a.md']) {
    assert.ok(isIgnored(file), file)
    assert.equal(checkLines([dash], [line(EM_DASH, file)], 'files').violations.length, 0)
  }
  assert.ok(!isIgnored('src/lock.ts'))
})

test('paths limit a rule to matching files', () => {
  const md = rule("id: md\nkind: forbid\npattern: TODO\npaths: ['*.md']", 'TODO', 'done')
  assert.equal(checkLines([md], [line('TODO', 'a.ts'), line('TODO', 'docs/a.md')], 'files').violations.length, 1)
})

test('targets decide where a rule applies', () => {
  const commitsOnly = rule('id: c\nkind: forbid\npattern: WIP\ntargets: [commits]', 'WIP', 'done')
  assert.equal(checkLines([commitsOnly], [line('WIP')], 'files').violations.length, 0)
  assert.equal(checkText([commitsOnly], 'WIP: stuff', 'commits', 'commit abc').violations.length, 1)
})

test('unless exempts a match', () => {
  const close = rule("id: close\nkind: forbid\ntargets: [commands]\npattern: '\\bgh pr close\\b'\nunless: '--comment'", 'gh pr close 1', 'gh pr close 1 --comment "dup"')
  assert.equal(checkCommand([close], 'gh pr close 12').violations.length, 1)
  assert.equal(checkCommand([close], 'gh pr close 12 --comment "superseded by #13"').violations.length, 0)
  assert.equal(checkCommand([close], 'gh pr close 12 # notwice-allow close').overrides.length, 1)
})

test('require checks ordered patterns in a text', () => {
  const sections = rule("id: s\nkind: require\npattern: ['^## Problem', '^## Approach']\ntargets: [pr]", '## Approach', '## Problem\n## Approach')
  assert.equal(checkText([sections], '## Problem\nx\n## Approach\ny', 'pr', 'PR').violations.length, 0)
  const outOfOrder = checkText([sections], '## Approach\ny\n## Problem\nx', 'pr', 'PR').violations
  assert.equal(outOfOrder.length, 1)
  assert.match(outOfOrder[0].excerpt, /Approach/)
  assert.equal(checkText([sections], 'nothing\nnotwice-allow s', 'pr', 'PR').overrides.length, 1)
})

test('size gate counts added lines and skips generated files', () => {
  const size = rule('id: size\nkind: max-added-lines\nmax: 300', '400 0 a.ts', '10 0 a.ts')
  const numstat = parseNumstat('250\t3\tsrc/a.ts\n60\t0\tsrc/b.ts\n9000\t0\tpackage-lock.json\n-\t-\timage.png')
  assert.equal(numstat.length, 3)
  const result = checkSize([size], numstat)
  assert.equal(result.violations.length, 1)
  assert.match(result.violations[0].excerpt, /310 added lines \(limit 300\)/)
  assert.equal(checkSize([size], numstat.slice(0, 1)).violations.length, 0)
  assert.equal(checkSize([size], numstat, 'body\nnotwice-allow size').overrides.length, 1)
})

test('prove reports a Bad that passes and a Good that fires', () => {
  assert.deepEqual(prove(dash), [])
  const weak = rule("id: w\nkind: forbid\npattern: 'zzz'", 'no match here', 'fine')
  assert.deepEqual(prove(weak), ['the Bad example does not trigger it'])
  const broad = rule("id: b\nkind: forbid\npattern: '.'", 'x', 'y')
  assert.deepEqual(prove(broad), ['the Good example triggers it'])
  const missing = parseRule('---\nkind: forbid\npattern: x\n---\nText only\n', 'm.md')
  assert.deepEqual(prove(missing), ['no ## Bad example', 'no ## Good example'])
})
