import { spawnSync } from 'node:child_process'
import { copyFileSync, existsSync, mkdtempSync, rmSync, statSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { attempt, logError } from './store.mjs'

export const EMPTY_TREE = '4b825dc642cb6eb9a060e54bf8d69288fbee4904'
const MAX_UNTRACKED_BYTES = 1024 * 1024
const GIT_ENV = { GIT_LITERAL_PATHSPECS: '1', GIT_OPTIONAL_LOCKS: '0' }
const DIFF_FLAGS = ['-U0', '-M', '--no-color', '--no-ext-diff', '--no-textconv', '--text', '--src-prefix=a/', '--dst-prefix=b/']
const C_ESCAPES = { a: '\x07', b: '\b', t: '\t', n: '\n', v: '\v', f: '\f', r: '\r' }

export function run(command, args, cwd, { env, input } = {}) {
  const options = { cwd, input, encoding: 'utf8', maxBuffer: 256 * 1024 * 1024, timeout: 8000, env: { ...process.env, ...env } }
  const result = spawnSync(command, args, options)
  if (result.error) logError(`${command} ${args.join(' ').slice(0, 80)}: ${result.error.message}`)
  return result.status === 0 ? result.stdout : null
}

export const git = (cwd, ...args) => run('git', ['-c', 'core.quotePath=false', ...args], cwd, { env: GIT_ENV })
const gitWithIndex = (root, index, args, input) => run('git', args, root, { env: { ...GIT_ENV, GIT_INDEX_FILE: index }, input })

export const repoRoot = (cwd) => git(cwd, 'rev-parse', '--show-toplevel')?.trim() || null

export const revParse = (root, rev) => git(root, 'rev-parse', '--verify', '-q', rev)?.trim() || null

export function defaultRef(root) {
  const head = git(root, 'rev-parse', '--abbrev-ref', 'origin/HEAD')?.trim()
  if (head && head !== 'origin/HEAD') return head
  const candidates = ['refs/remotes/origin/main', 'refs/remotes/origin/master', 'refs/heads/main', 'refs/heads/master']
  const existing = (git(root, 'for-each-ref', '--format=%(refname)', ...candidates) ?? '').split('\n')
  return candidates.find((ref) => existing.includes(ref)) ?? null
}

export function baseCommit(root, ref = defaultRef(root), head = 'HEAD') {
  if (!revParse(root, 'HEAD')) return EMPTY_TREE
  if (!ref) return 'HEAD'
  const merging = head === 'HEAD' && revParse(root, 'MERGE_HEAD') ? ['MERGE_HEAD'] : []
  return git(root, 'merge-base', ref, head, ...merging)?.trim() || null
}

function unquotePath(raw) {
  const path = raw.replace(/\t$/, '')
  if (!path.startsWith('"')) return path
  return path.slice(1, -1).replace(/\\([0-7]{3}|.)/g, (_, escaped) => unescapeC(escaped))
}

function unescapeC(escaped) {
  if (escaped.length === 3) return String.fromCharCode(parseInt(escaped, 8))
  return C_ESCAPES[escaped] ?? escaped
}

export function parseDiff(text) {
  const added = []
  const removed = new Set()
  let file = null
  let header = false
  let next = 0
  for (const raw of text.split('\n')) {
    if (raw.startsWith('diff --git ')) {
      header = true
      file = null
    } else if (raw.startsWith('@@')) {
      header = false
      next = Number(raw.match(/\+(\d+)/)?.[1] ?? 0)
    } else if (header && raw.startsWith('+++ ')) {
      const path = unquotePath(raw.slice(4))
      file = path.startsWith('b/') ? path.slice(2) : null
    } else if (!header && raw.startsWith('-')) {
      removed.add(raw.slice(1).trim())
    } else if (!header && file && raw.startsWith('+')) {
      added.push({ file, line: next++, text: raw.slice(1) })
    }
  }
  return added.filter((l) => !removed.has(l.text.trim()) && !/[\0�]/.test(l.text))
}

export const diffLines = (root, ...revs) => parseDiff(git(root, 'diff', ...DIFF_FLAGS, ...revs) ?? '')

export function linesNewAgainst(root, diffs) {
  const key = (l) => `${l.file}:${l.line}`
  const [first, ...others] = diffs.map((revs) => diffLines(root, ...revs))
  const seen = others.map((lines) => new Set(lines.map(key)))
  return first.filter((l) => seen.every((set) => set.has(key(l))))
}

export function worktreeTree(root) {
  const dir = mkdtempSync(join(tmpdir(), 'notwice-index-'))
  const index = join(dir, 'index')
  try {
    const current = resolve(root, git(root, 'rev-parse', '--git-path', 'index')?.trim() ?? '.git/index')
    if (existsSync(current)) copyFileSync(current, index)
    gitWithIndex(root, index, ['add', '-u'])
    const untracked = smallUntracked(root)
    if (untracked.length) gitWithIndex(root, index, ['add', '--pathspec-from-file=-', '--pathspec-file-nul'], untracked.join('\0'))
    return gitWithIndex(root, index, ['write-tree'])?.trim() || null
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
}

function smallUntracked(root) {
  const out = git(root, 'ls-files', '--others', '--exclude-standard', '-z') ?? ''
  return out.split('\0').filter((file) => file && sizeOf(join(root, file)) <= MAX_UNTRACKED_BYTES)
}

const sizeOf = (path) => attempt(() => statSync(path).size, Infinity)

export function parseNumstat(text) {
  return text
    .split('\n')
    .map((line) => line.trim().split(/\s+/))
    .filter(([added, , ...file]) => /^\d+$/.test(added) && file.length)
    .map(([added, , ...file]) => ({ added: Number(added), file: file.join(' ') }))
}

export function numstat(root, base, head) {
  return parseNumstat(git(root, 'diff', '--numstat', '-M', '--no-ext-diff', '--no-textconv', base, ...(head ? [head] : [])) ?? '')
}

export function commitsIn(root, ref, exclude = [], since = 0) {
  const hidden = exclude.filter((rev) => rev && rev !== EMPTY_TREE).map((rev) => `^${rev}`)
  const out = git(root, 'log', '-z', '--no-merges', '--format=%h %at%n%B', ref, ...hidden, '--') ?? ''
  return out.split('\0').filter(Boolean).map(parseCommit).filter((c) => c.at >= since)
}

function parseCommit(entry) {
  const [header, ...body] = entry.split('\n')
  const [sha, at] = header.split(' ')
  return { sha, at: Number(at), message: body.join('\n').trim() }
}

export function repoName(root) {
  const url = git(root, 'remote', 'get-url', 'origin')?.trim() ?? ''
  return url.match(/[:/]([^/:]+\/[^/]+?)(\.git)?$/)?.[1] ?? root.split('/').pop()
}
