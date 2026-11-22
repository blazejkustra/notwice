import { execFileSync, spawnSync } from 'node:child_process'
import { copyFileSync, mkdirSync, mkdtempSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { after } from 'node:test'
import { fileURLToPath } from 'node:url'

export const ROOT = fileURLToPath(new URL('..', import.meta.url))
export const BIN = join(ROOT, 'bin', 'notwice')
export const FAKE_BIN = join(ROOT, 'test', 'fixtures', 'bin')
export const FIXTURE_RULES = join(ROOT, 'test', 'fixtures', 'rules')
export const EM_DASH = '\u2014'
export const PRIVATE_KEY_LINE = ['-----BEGIN', 'PRIVATE KEY-----'].join(' ')

const created = []
after(() => created.forEach((dir) => rmSync(dir, { recursive: true, force: true })))

export function tempDir(prefix = 'notwice-test-') {
  const dir = mkdtempSync(join(tmpdir(), prefix))
  created.push(dir)
  return dir
}

process.env.NOTWICE_HOME = tempDir('notwice-unit-home-')

export function write(dir, file, text) {
  const path = join(dir, file)
  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(path, text)
  return path
}

export function writePatch(before, after) {
  if (before == null) return []
  const old = before.split('\n')
  const now = after.split('\n')
  let start = 0
  while (start < old.length && start < now.length && old[start] === now[start]) start++
  let end = 0
  while (end < old.length - start && end < now.length - start && old.at(-1 - end) === now.at(-1 - end)) end++
  const removed = old.slice(start, old.length - end).map((l) => `-${l}`)
  const added = now.slice(start, now.length - end).map((l) => `+${l}`)
  return [{ oldStart: start + 1, oldLines: removed.length, newStart: start + 1, newLines: added.length, lines: [...removed, ...added] }]
}

export function sh(cwd, command, ...args) {
  return execFileSync(command, args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] })
}

export const gitIn = (cwd, ...args) => sh(cwd, 'git', '-c', 'user.name=t', '-c', 'user.email=t@t', '-c', 'commit.gpgsign=false', ...args)

export function makeRepo({ remote = true } = {}) {
  const dir = tempDir()
  gitIn(dir, 'init', '-q', '-b', 'main')
  write(dir, 'README.md', 'hello\n')
  gitIn(dir, 'add', '.')
  gitIn(dir, 'commit', '-qm', 'init')
  if (remote) {
    const bare = tempDir('notwice-remote-')
    gitIn(bare, 'init', '-q', '--bare', '-b', 'main')
    gitIn(dir, 'remote', 'add', 'origin', bare)
    gitIn(dir, 'push', '-q', '-u', 'origin', 'main')
  }
  gitIn(dir, 'checkout', '-q', '-b', 'feature')
  return dir
}

export function commit(dir, files, message) {
  for (const [file, text] of Object.entries(files)) write(dir, file, text)
  gitIn(dir, 'add', '-A')
  gitIn(dir, 'commit', '-qm', message)
}

export function makeHome({ approve = true } = {}) {
  const home = tempDir('notwice-home-')
  notwice(['init'], { home })
  for (const name of readdirSync(FIXTURE_RULES)) copyFileSync(join(FIXTURE_RULES, name), join(home, 'proposed', name))
  if (approve) notwice(['approve', ...readdirSync(join(home, 'proposed')).map((n) => n.replace(/\.md$/, ''))], { home })
  return home
}

export function approveExample(home, id) {
  copyFileSync(join(ROOT, 'examples', 'rules', `${id}.md`), join(home, 'proposed', `${id}.md`))
  notwice(['approve', id], { home })
  return home
}

const SESSION_ENV = { NOTWICE_SESSION: '', T3CODE_THREAD_ID: '', CLAUDE_ENV_FILE: '' }

export function notwice(args, { home, cwd = ROOT, input, env = {} } = {}) {
  const result = spawnSync(process.execPath, [BIN, ...args], {
    cwd,
    input,
    encoding: 'utf8',
    env: { ...process.env, ...SESSION_ENV, NOTWICE_HOME: home ?? process.env.NOTWICE_HOME, PATH: `${FAKE_BIN}:${process.env.PATH}`, ...env },
  })
  return { code: result.status, stdout: result.stdout, stderr: result.stderr }
}

export function hook(input, { home, env } = {}) {
  const result = notwice(['hook'], { home, input: JSON.stringify({ session_id: 's1', ...input }), env, cwd: input.cwd })
  return { ...result, output: result.stdout ? JSON.parse(result.stdout) : null }
}
