import assert from 'node:assert/strict'
import { test } from 'node:test'
import { EM_DASH, commit, gitIn, makeHome, makeRepo, notwice, tempDir, write } from './helpers.mjs'

const DASH_RULE = `---\nkind: forbid\npattern: '${EM_DASH}'\ntargets: [files, commits, pr]\n---\nNo em dashes.\n\n## Bad\na ${EM_DASH} b\n\n## Good\na, b\n`
const NO_CI_ENV = {
  GITHUB_EVENT_PATH: '', GITHUB_BASE_REF: '', GITHUB_ACTIONS: '', CI_MERGE_REQUEST_IID: '', CI_MERGE_REQUEST_DIFF_BASE_SHA: '',
  CI_MERGE_REQUEST_SOURCE_BRANCH_SHA: '', CI_MERGE_REQUEST_TITLE: '', CI_MERGE_REQUEST_DESCRIPTION: '', CI_MERGE_REQUEST_DESCRIPTION_IS_TRUNCATED: '',
}

function setup() {
  const repo = makeRepo()
  gitIn(repo, 'checkout', '-q', 'main')
  commit(repo, { '.notwice/rules/no-dash.md': DASH_RULE }, 'Add the no-dash rule')
  gitIn(repo, 'checkout', '-q', 'feature')
  gitIn(repo, 'merge', '-q', 'main')
  commit(repo, { 'docs.md': `Fast ${EM_DASH} simple\n` }, 'Add docs\n\nCo-Authored-By: Claude <noreply@anthropic.com>')
  return { repo, home: makeHome(), base: gitIn(repo, 'rev-parse', 'main').trim() }
}

test('check --ci reads a GitLab merge request from its CI variables', () => {
  const { repo, home, base } = setup()
  const env = { ...NO_CI_ENV, CI_MERGE_REQUEST_DIFF_BASE_SHA: base, CI_MERGE_REQUEST_IID: '5', CI_MERGE_REQUEST_TITLE: 'Add docs', CI_MERGE_REQUEST_DESCRIPTION: `Body ${EM_DASH} here` }
  const r = notwice(['check', '--ci'], { home, cwd: repo, env })
  assert.equal(r.code, 1)
  assert.match(r.stdout, /- docs\.md:1 \[no-dash\]/)
  assert.match(r.stdout, /- MR !5:3 \[no-dash\]/)
  assert.doesNotMatch(r.stdout, /::error|no-claude-attribution/)
})

test('check --ci works in any CI with --base, a PR body file and JSON output', () => {
  const { repo, home } = setup()
  const body = write(tempDir(), 'body.md', 'A plain body.\n')
  const r = notwice(['check', '--ci', '--base', 'main', '--pr-title', 'Add docs', '--pr-body-file', body, '--format', 'json'], { home, cwd: repo, env: NO_CI_ENV })
  assert.equal(r.code, 1)
  const report = JSON.parse(r.stdout)
  assert.equal(report.blocking, 1)
  assert.deepEqual(report.violations.map((v) => `${v.where} ${v.id}`), ['docs.md:1 no-dash'])
  gitIn(repo, 'checkout', '-q', 'main')
  assert.match(notwice(['check', '--ci', '--base', 'main'], { home, cwd: repo, env: NO_CI_ENV }).stdout, /^notwice: 0 blocking, 0 warning\(s\), 0 allowed$/m)
})

const rev = (repo, ref) => gitIn(repo, 'rev-parse', ref).trim()

function mergedResultsCheckout(repo, mrHead) {
  gitIn(repo, 'checkout', '-q', '--detach', 'main')
  gitIn(repo, 'merge', '-q', '--no-ff', '--no-edit', mrHead)
}

test('check --ci in a GitLab merged-results pipeline judges only the merge request, never what the target gained', () => {
  const repo = makeRepo()
  gitIn(repo, 'checkout', '-q', 'main')
  commit(repo, { '.notwice/rules/no-dash.md': DASH_RULE }, 'Add the no-dash rule')
  const fork = rev(repo, 'main')
  gitIn(repo, 'checkout', '-q', '-B', 'feature', 'main')
  commit(repo, { 'mr.md': 'clean\n' }, 'Add mr')
  const clean = rev(repo, 'feature')
  gitIn(repo, 'checkout', '-q', 'main')
  commit(repo, { 'other-mr.md': `merged by another MR ${EM_DASH} yes\n` }, `Other MR ${EM_DASH} merged`)
  const env = (head) => ({ ...NO_CI_ENV, CI_MERGE_REQUEST_DIFF_BASE_SHA: fork, CI_MERGE_REQUEST_SOURCE_BRANCH_SHA: head, CI_MERGE_REQUEST_IID: '9' })
  mergedResultsCheckout(repo, clean)
  const passed = notwice(['check', '--ci'], { home: tempDir(), cwd: repo, env: env(clean) })
  assert.equal(passed.code, 0, passed.stdout)
  gitIn(repo, 'checkout', '-q', 'feature')
  commit(repo, { 'mr.md': `clean\nmine ${EM_DASH} new\n` }, 'Extend mr')
  const dirty = rev(repo, 'feature')
  mergedResultsCheckout(repo, dirty)
  const failed = notwice(['check', '--ci'], { home: tempDir(), cwd: repo, env: env(dirty) })
  assert.equal(failed.code, 1)
  assert.match(failed.stdout, /- mr\.md:2 \[no-dash\]/)
  assert.doesNotMatch(failed.stdout, /other-mr|Other MR/)
})

const SECTIONS_RULE = `---
kind: require
pattern: ['^## Problem\\s*$', '^## Tests\\s*$', '^## Screenshots\\s*$']
---
PR bodies use these sections.
`

test('check --ci skips require rules on a description GitLab truncated, and still checks its first 2,700 characters', () => {
  const repo = makeRepo()
  gitIn(repo, 'checkout', '-q', 'main')
  commit(repo, { '.notwice/rules/no-dash.md': DASH_RULE, '.notwice/rules/sections.md': SECTIONS_RULE }, 'Add rules')
  gitIn(repo, 'checkout', '-q', '-B', 'feature', 'main')
  commit(repo, { 'mr.md': 'clean\n' }, 'Add mr')
  const body = `## Problem\nSlow.\n\n## Tests\n${'- a long list of what was verified\n'.repeat(120)}\n## Screenshots\n`
  const env = (description) => ({
    ...NO_CI_ENV, CI_MERGE_REQUEST_DIFF_BASE_SHA: rev(repo, 'main'), CI_MERGE_REQUEST_IID: '9', CI_MERGE_REQUEST_TITLE: 'Speed up',
    CI_MERGE_REQUEST_DESCRIPTION: description.slice(0, 2700), CI_MERGE_REQUEST_DESCRIPTION_IS_TRUNCATED: 'true',
  })
  const passed = notwice(['check', '--ci'], { home: tempDir(), cwd: repo, env: env(body) })
  assert.equal(passed.code, 0, passed.stdout)
  assert.match(passed.stdout, /first 2,700 characters/)
  const failed = notwice(['check', '--ci'], { home: tempDir(), cwd: repo, env: env(body.replace('Slow.', `Slow ${EM_DASH} very.`)) })
  assert.equal(failed.code, 1)
  assert.match(failed.stdout, /- MR !9:4 \[no-dash\]/)
})

test('check --ci says how many project rules it checked, and says so when there are none', () => {
  const { repo, home } = setup()
  const counted = notwice(['check', '--ci', '--base', 'main'], { home, cwd: repo, env: NO_CI_ENV })
  assert.match(counted.stdout, /^notwice: checked 1 project rule\(s\) from \.notwice\/rules at [0-9a-f]{12}$/m)
  const bare = makeRepo()
  commit(bare, { 'a.md': 'Generated with [Claude Code](https://claude.com/claude-code)\n' }, 'Add a')
  const none = notwice(['check', '--ci', '--base', 'main'], { home, cwd: bare, env: NO_CI_ENV })
  assert.equal(none.code, 0)
  assert.match(none.stdout, /^notwice: no project rules in \.notwice\/rules at [0-9a-f]{12}, so nothing was checked\. Personal rules never run in CI/m)
})
