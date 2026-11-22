import assert from 'node:assert/strict'
import { test } from 'node:test'
import { baseCommit, commitsIn, defaultRef, diffLines, numstat, parseDiff, worktreeTree } from '../src/core/git.mjs'
import { commit, gitIn, makeRepo, write } from './helpers.mjs'

const lineTexts = (lines) => lines.map((l) => `${l.file}:${l.line}:${l.text}`)

test('parseDiff tracks new line numbers and survives "+++" content lines', () => {
  const diff = [
    'diff --git a/a.md b/a.md',
    '--- a/a.md',
    '+++ b/a.md',
    '@@ -1,0 +2,2 @@',
    '+first',
    '++++ looks like a header',
    '@@ -9 +10 @@',
    '+tenth',
    'diff --git a/gone.md b/gone.md',
    '--- a/gone.md',
    '+++ /dev/null',
    '@@ -1 +0,0 @@',
    '-old',
  ].join('\n')
  assert.deepEqual(parseDiff(diff), [
    { file: 'a.md', line: 2, text: 'first' },
    { file: 'a.md', line: 3, text: '+++ looks like a header' },
    { file: 'a.md', line: 10, text: 'tenth' },
  ])
})

test('the worktree tree covers branch commits, uncommitted edits and untracked files, never old content', () => {
  const repo = makeRepo()
  gitIn(repo, 'checkout', '-q', 'main')
  commit(repo, { 'old.md': 'already on main\n' }, 'old')
  gitIn(repo, 'push', '-q')
  gitIn(repo, 'checkout', '-q', 'feature')
  gitIn(repo, 'merge', '-q', 'main')
  commit(repo, { 'a.md': 'committed\n' }, 'add a')
  write(repo, 'README.md', 'hello\nedited\n')
  write(repo, 'new/b.md', 'untracked\n')
  const lines = lineTexts(diffLines(repo, baseCommit(repo), worktreeTree(repo)))
  assert.deepEqual(lines.sort(), ['README.md:2:edited', 'a.md:1:committed', 'new/b.md:1:untracked'])
  assert.equal(gitIn(repo, 'status', '--short'), ' M README.md\n?? new/\n')
})

test('base is the merge-base with origin default, falling back to local main', () => {
  const repo = makeRepo()
  assert.equal(defaultRef(repo), 'refs/remotes/origin/main')
  const local = makeRepo({ remote: false })
  assert.equal(defaultRef(local), 'refs/heads/main')
  commit(local, { 'x.md': 'x\n' }, 'x')
  assert.deepEqual(numstat(local, baseCommit(local), 'HEAD').map((e) => e.file), ['x.md'])
})

test('on the default branch with no remote only uncommitted changes count', () => {
  const repo = makeRepo({ remote: false })
  gitIn(repo, 'checkout', '-q', 'main')
  assert.equal(baseCommit(repo), gitIn(repo, 'rev-parse', 'HEAD').trim())
  write(repo, 'README.md', 'hello\nnew\n')
  assert.deepEqual(diffLines(repo, baseCommit(repo), worktreeTree(repo)).map((l) => l.text), ['new'])
})

test('commitsIn skips merges and excluded refs and reads multi-line messages', () => {
  const repo = makeRepo()
  commit(repo, { 'a.md': 'a\n' }, 'first')
  gitIn(repo, 'push', '-q', '-u', 'origin', 'feature')
  commit(repo, { 'b.md': 'b\n' }, 'second\n\nbody line')
  const list = commitsIn(repo, 'HEAD', ['origin/feature'])
  assert.deepEqual(list.map((c) => c.message), ['second\n\nbody line'])
  assert.equal(commitsIn(repo, 'HEAD', ['origin/feature'], Date.now() / 1000 + 60).length, 0)
})

test('a repo with no commits yet diffs against the empty tree', () => {
  const repo = makeRepo({ remote: false })
  gitIn(repo, 'checkout', '-q', '--orphan', 'fresh')
  gitIn(repo, 'rm', '-rfq', '.')
  write(repo, 'first.md', 'line\n')
  assert.deepEqual(diffLines(repo, baseCommit(repo), worktreeTree(repo)).map((l) => l.text), ['line'])
})
