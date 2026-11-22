import assert from 'node:assert/strict'
import { test } from 'node:test'
import { commitMessage, ghText, guardText, isGit, parseCommand, readCommand } from '../src/core/command.mjs'
import { tempDir, write } from './helpers.mjs'

const stepOf = (command, cwd = '/', match = () => true) => readCommand(command, cwd).find(match)
const commitStep = (command, cwd) => stepOf(command, cwd, (s) => isGit(s, 'commit'))
const ghStep = (command, cwd) => stepOf(command, cwd, (s) => s.program === 'gh')

test('splits chained commands into segments, keeping quotes, substitutions and heredocs whole', () => {
  const segments = parseCommand("git add -A && git commit -m \"a; b\" | tee log.txt; echo 'x && y' 2>&1")
  assert.deepEqual(segments.map((s) => s.words.map((w) => w.text)), [
    ['git', 'add', '-A'], ['git', 'commit', '-m', 'a; b'], ['tee', 'log.txt'], ['echo', 'x && y', '2>&1'],
  ])
  const [heredoc] = parseCommand("cat > notes.md <<'EOF'\ndon't && stop\nEOF\n")
  assert.equal(heredoc.heredoc, "don't && stop")
})

test('finds git subcommands behind global options and env assignments', () => {
  for (const command of ['git -c a=b push', 'git --no-pager push origin x', 'GIT_TRACE=1 git -C repo push', 'command git push']) {
    assert.ok(isGit(stepOf(command, '/home', (s) => s.program === 'git'), 'push'), command)
  }
  assert.equal(stepOf('git -C ../repo push', '/home/me', (s) => s.program === 'git').cwd, '/home/repo')
  assert.equal(stepOf('cd /tmp/x && git push', '/home', (s) => s.program === 'git').cwd, '/tmp/x')
  assert.ok(!stepOf('rg -n "git commit" docs', '/', (s) => isGit(s, 'commit')))
  assert.deepEqual(stepOf('git push 2>&1 > out.txt < /dev/null | tail -5', '/', (s) => isGit(s, 'push')).args, [])
})

test('extracts commit messages from -m flags and heredocs, and marks dynamic ones unreadable', () => {
  assert.deepEqual(commitMessage(commitStep('git commit -m "Fix it" -m "Body \\"quoted\\""')), { text: 'Fix it\n\nBody "quoted"' })
  assert.deepEqual(commitMessage(commitStep("git commit -am 'One'")), { text: 'One' })
  const heredoc = 'git add . && git commit -m "$(cat <<\'EOF\'\nSubject\n\nCo-Authored-By: Claude <noreply@anthropic.com>\nEOF\n)"'
  assert.deepEqual(commitMessage(commitStep(heredoc)), { text: 'Subject\n\nCo-Authored-By: Claude <noreply@anthropic.com>' })
  assert.deepEqual(commitMessage(commitStep('git commit -F - <<EOF\nFrom stdin\nEOF\n')), { text: 'From stdin' })
  assert.deepEqual(commitMessage(commitStep('git commit -m "$MSG"')), { unreadable: true })
  assert.equal(commitMessage(commitStep('git commit --amend --no-edit')), null)
})

test('ignores heredocs that belong to other segments', () => {
  const command = "cat > notes.md <<'EOF'\nnotes\nEOF\ngit commit -m 'add notes'"
  assert.deepEqual(commitMessage(commitStep(command)), { text: 'add notes' })
})

test('extracts gh title and body from flags, heredocs and body files', () => {
  assert.deepEqual(ghText(ghStep('gh pr create --title "T" --body "B"')), { target: 'pr', title: 'T', body: 'B', unreadable: false, number: null })
  const heredoc = 'gh pr create --title "Add x" --body "$(cat <<\'EOF\'\n## Problem\nSaid "hi"\nEOF\n)"'
  assert.equal(ghText(ghStep(heredoc)).body, '## Problem\nSaid "hi"')
  const dir = tempDir()
  write(dir, 'body.md', '## Problem\nfrom file\n')
  assert.equal(ghText(ghStep('gh pr edit 3 --body-file body.md', dir)).body, '## Problem\nfrom file\n')
  assert.equal(ghText(ghStep('gh pr create --fill')).unreadable, true)
  assert.deepEqual(ghText(ghStep('gh pr close 4 -c "dup of #3"')), { target: 'comments', title: null, body: 'dup of #3', unreadable: false, number: '4' })
  assert.equal(ghText(ghStep('gh pr view 4')), null)
})

test('guard text blanks message values so guards never match them', () => {
  assert.equal(guardText(commitStep('git commit -m "never gh pr close"')), 'git commit -m …')
  assert.equal(guardText(ghStep('gh pr create --title=x --body "y"')), 'gh pr create --title=… --body …')
  assert.equal(guardText(ghStep('gh pr close 3 --comment "why"')), 'gh pr close 3 --comment why')
})
