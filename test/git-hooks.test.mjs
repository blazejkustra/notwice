import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { chmodSync, readFileSync, rmSync, symlinkSync } from 'node:fs'
import { join } from 'node:path'
import { test } from 'node:test'
import { BIN, EM_DASH, gitIn, makeHome, makeRepo, notwice, tempDir, write } from './helpers.mjs'

const ATTRIBUTION = 'Co-Authored-By: Claude <noreply@anthropic.com>'
const HUSKY_HOOK = '#!/bin/sh\necho "husky $(basename "$0")" >> "$(git rev-parse --git-dir)/husky.log"\n'

function setup() {
  const home = makeHome()
  const repo = makeRepo()
  const globalConfig = write(tempDir(), 'gitconfig', '')
  const env = { ...process.env, NOTWICE_HOME: home, GIT_CONFIG_GLOBAL: globalConfig, NOTWICE_SESSION: '' }
  const git = (...args) => spawnSync('git', ['-c', 'user.name=t', '-c', 'user.email=t@t', '-c', 'commit.gpgsign=false', ...args], { cwd: repo, env, encoding: 'utf8' })
  const cli = (...args) => notwice(args, { home, cwd: repo, env: { GIT_CONFIG_GLOBAL: globalConfig } })
  return { home, repo, globalConfig, env, git, cli }
}

function addHusky(repo) {
  for (const name of ['pre-commit', 'commit-msg']) chmodSync(write(repo, `.husky/_/${name}`, HUSKY_HOOK), 0o755)
  gitIn(repo, 'config', 'core.hooksPath', '.husky/_')
}

const huskyRuns = (repo) => readFileSync(join(repo, '.git', 'husky.log'), 'utf8').trim().split('\n').length

test('git hooks run next to husky, block bad commits and pushes, and uninstall cleanly', () => {
  const { repo, git, cli } = setup()
  addHusky(repo)
  const huskyFiles = ['pre-commit', 'commit-msg'].map((name) => readFileSync(join(repo, '.husky/_', name), 'utf8'))
  assert.equal(cli('install-git-hooks').code, 0)
  assert.match(git('hook', 'list', 'pre-commit').stdout, /notwice-pre-commit/)

  write(repo, 'notes.md', 'plain notes\n')
  git('add', 'notes.md')
  assert.equal(git('commit', '-qm', 'Add notes').status, 0)
  assert.equal(huskyRuns(repo), 2)

  write(repo, 'notes.md', 'plain notes\nmore\n')
  git('add', 'notes.md')
  const trailer = git('commit', '-qm', 'Add more', '-m', ATTRIBUTION)
  assert.equal(trailer.status, 1)
  assert.match(trailer.stderr, /notwice blocked this commit:\n- commit message:3 \[no-claude-attribution\]/)
  assert.match(trailer.stderr, /To keep one as it is, add "notwice-allow no-claude-attribution"/)
  assert.equal(huskyRuns(repo), 4)

  write(repo, 'notes.md', `plain notes\nfast ${EM_DASH} simple\n`)
  git('add', 'notes.md')
  assert.match(git('commit', '-qm', 'Add a pitch').stderr, /- notes\.md:2 \[no-em-dash\]/)

  write(repo, 'notes.md', 'plain notes\nmore\n')
  git('add', 'notes.md')
  assert.equal(git('commit', '-q', '--no-verify', '-m', 'Add more', '-m', ATTRIBUTION).status, 0)
  const push = git('push', '-q', 'origin', 'feature')
  assert.equal(push.status, 1)
  assert.match(push.stderr, /notwice blocked this push:\n- commit [0-9a-f]+:3 \[no-claude-attribution\]/)
  assert.equal(git('ls-remote', 'origin', 'feature').stdout, '')

  assert.equal(cli('uninstall-git-hooks').code, 0)
  assert.equal(git('config', '--local', '--get-regexp', '^hook\\.').stdout, '')
  assert.equal(git('config', 'core.hooksPath').stdout.trim(), '.husky/_')
  assert.deepEqual(['pre-commit', 'commit-msg'].map((name) => readFileSync(join(repo, '.husky/_', name), 'utf8')), huskyFiles)
  assert.equal(git('push', '-q', 'origin', 'feature').status, 0)
})

test('a plain .git/hooks script keeps running, and --global writes only to the global git config', () => {
  const { repo, git, cli, globalConfig } = setup()
  chmodSync(write(repo, '.git/hooks/commit-msg', HUSKY_HOOK), 0o755)
  assert.equal(cli('install-git-hooks', '--global').code, 0)
  assert.match(readFileSync(globalConfig, 'utf8'), /\[hook "notwice-commit-msg"\]\n\tcommand = .*' git-hook commit-msg"\n\tevent = commit-msg/)
  assert.equal(git('config', '--local', '--get-regexp', '^hook\\.').stdout, '')
  write(repo, 'a.md', 'a\n')
  git('add', 'a.md')
  assert.equal(git('commit', '-qm', 'Add a', '-m', ATTRIBUTION).status, 1)
  assert.equal(huskyRuns(repo), 1)
  assert.equal(git('commit', '-qm', 'Add a').status, 0)
  assert.equal(cli('uninstall-git-hooks', '--global').code, 0)
  assert.doesNotMatch(readFileSync(globalConfig, 'utf8'), /notwice/)
})

function commitFiles({ repo, git }, files, message, ...flags) {
  for (const [file, text] of Object.entries(files)) write(repo, file, text)
  git('add', '-A')
  return git('commit', '-q', ...flags, '-m', message)
}

function teammateCommit(ctx, branch, files, message) {
  ctx.git('checkout', '-q', '-B', branch, 'origin/main')
  commitFiles(ctx, files, message, '--no-verify')
  ctx.git('push', '-q', '--no-verify', 'origin', branch)
}

test('pre-push judges only new work after merging or rebasing main, and on a branch cut from a teammate branch', () => {
  const ctx = setup()
  const { git, cli } = ctx
  assert.equal(cli('install-git-hooks').code, 0)
  assert.equal(commitFiles(ctx, { 'a.md': 'a\n' }, 'Add a').status, 0)
  assert.equal(git('push', '-q', '-u', 'origin', 'feature').status, 0)
  teammateCommit(ctx, 'main', { 't.md': `t ${EM_DASH} teammate\n` }, `Teammate change\n\n${ATTRIBUTION}`)
  git('checkout', '-q', 'feature')
  assert.equal(git('merge', '-q', '--no-edit', 'origin/main').status, 0)
  const merged = git('push', '-q', 'origin', 'feature')
  assert.equal(merged.status, 0, merged.stderr)
  git('reset', '-q', '--hard', 'HEAD~1')
  assert.equal(git('rebase', '-q', 'origin/main').status, 0)
  const rebased = git('push', '-q', '--force-with-lease', 'origin', 'feature')
  assert.equal(rebased.status, 0, rebased.stderr)
  assert.equal(commitFiles(ctx, { 'b.md': `b ${EM_DASH} mine\n` }, 'Add b', '--no-verify').status, 0)
  assert.match(git('push', '-q', 'origin', 'feature').stderr, /b\.md:1 \[no-em-dash\]/)

  teammateCommit(ctx, 'teammate', { 'team.md': `team ${EM_DASH} work\n` }, `Team work\n\n${ATTRIBUTION}`)
  git('checkout', '-q', '-b', 'fix', '--track', 'origin/teammate')
  assert.equal(commitFiles(ctx, { 'fix.md': 'fix\n' }, 'Fix team work').status, 0)
  const fork = git('push', '-q', 'origin', 'fix')
  assert.equal(fork.status, 0, fork.stderr)
})

test('pre-commit judges only the resolution when concluding a conflicted merge of main', () => {
  const ctx = setup()
  const { repo, git, cli } = ctx
  assert.equal(commitFiles(ctx, { 'copy.md': 'Title\n' }, 'Add copy').status, 0)
  git('push', '-q', 'origin', 'feature:main')
  assert.equal(commitFiles(ctx, { 'copy.md': 'Feature title\n' }, 'Retitle').status, 0)
  teammateCommit(ctx, 'main', { 'copy.md': `Main ${EM_DASH} title\n`, 'other.md': `other ${EM_DASH} main\n` }, 'Main copy')
  git('checkout', '-q', 'feature')
  assert.equal(cli('install-git-hooks').code, 0)
  assert.notEqual(git('merge', '-q', 'origin/main').status, 0)
  write(repo, 'copy.md', `Main ${EM_DASH} title\nmine ${EM_DASH} new\n`)
  git('add', '-A')
  assert.match(git('commit', '-q', '--no-edit').stderr, /copy\.md:2 \[no-em-dash\]/)
  write(repo, 'copy.md', `Main ${EM_DASH} title\n`)
  git('add', '-A')
  const resolved = git('commit', '-q', '--no-edit')
  assert.equal(resolved.status, 0, resolved.stderr)
})

test('commit-msg applies git\'s cleanup: commit -v diffs and comment lines are never checked as message text', () => {
  const ctx = setup()
  const { repo, env, git, cli } = ctx
  assert.equal(commitFiles(ctx, { 'notes.md': `fast ${EM_DASH} simple\n` }, 'Add notes', '--no-verify').status, 0)
  assert.equal(cli('install-git-hooks').code, 0)
  const commitWithEditor = (message) => {
    const editor = write(tempDir(), 'editor.sh', `#!/bin/sh\nprintf '%s\\n' '${message}' | cat - "$1" > "$1.new" && mv "$1.new" "$1"\n`)
    chmodSync(editor, 0o755)
    const args = ['-c', 'user.name=t', '-c', 'user.email=t@t', '-c', 'commit.gpgsign=false', 'commit', '-q', '-v']
    return spawnSync('git', args, { cwd: repo, env: { ...env, GIT_EDITOR: editor }, encoding: 'utf8' })
  }
  write(repo, 'notes.md', 'fast and simple\n')
  git('add', '-A')
  const verbose = commitWithEditor('Remove the em dash')
  assert.equal(verbose.status, 0, verbose.stderr)
  write(repo, 'notes.md', 'fast and simple, really\n')
  git('add', '-A')
  const trailer = commitWithEditor(`Say more\n\n${ATTRIBUTION}`)
  assert.match(trailer.stderr, /commit message:3 \[no-claude-attribution\]/)
})

test('a git hook whose notwice binary is gone warns and lets the commit through', () => {
  const ctx = setup()
  const { repo, env, git } = ctx
  const link = join(tempDir(), 'notwice')
  symlinkSync(BIN, link)
  const installed = spawnSync(process.execPath, [link, 'install-git-hooks'], { cwd: repo, env, encoding: 'utf8' })
  assert.equal(installed.status, 0, installed.stderr)
  assert.equal(commitFiles(ctx, { 'a.md': 'a\n' }, `Add a\n\n${ATTRIBUTION}`).status, 1)
  rmSync(link)
  const committed = commitFiles(ctx, { 'b.md': 'b\n' }, 'Add b')
  assert.equal(committed.status, 0, committed.stderr)
  assert.match(committed.stderr, /notwice: .*notwice is missing, so the pre-commit check was skipped\. Remove it with: git config --local --remove-section hook\.notwice-pre-commit/)
  assert.equal(git('push', '-q', 'origin', 'feature').status, 0)
})

test('uninstall-git-hooks in a repo says when global hooks keep running', () => {
  const { cli } = setup()
  assert.equal(cli('install-git-hooks', '--global').code, 0)
  const local = cli('uninstall-git-hooks')
  assert.match(local.stdout, /still installed globally; remove them with notwice uninstall-git-hooks --global/)
  assert.equal(cli('uninstall-git-hooks', '--global').code, 0)
  assert.doesNotMatch(cli('uninstall-git-hooks').stdout, /still installed globally/)
})
