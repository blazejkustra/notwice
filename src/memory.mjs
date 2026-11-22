import { closeSync, existsSync, openSync, readSync, statSync } from 'node:fs'
import { homedir } from 'node:os'
import { basename, dirname, join, relative } from 'node:path'
import { DAY_MS, loadDir, parseJson, readJsonl, readNames, readText, recentFires, tilde } from './core/store.mjs'

const TRANSCRIPT_HEAD = 128 * 1024
const INDEX_LIMITS = { lines: 200, bytes: 25 * 1024 }
const SCOPE_WEIGHT = { global: 2, project: 1, thread: 0, orphan: -1 }
const DUP = { shared: 5, ratio: 0.3 }
const ENFORCE_AT = 4
const INSTRUCTION_FILES = ['CLAUDE.md', '.claude/CLAUDE.md', 'CLAUDE.local.md']
const GLOBAL_HINT = /\b(?:every agent|every brief|any session|this mac|always)\b/i
const PATH = /(?<![\w.:/~-])(?:~|\/(?:Users|home|tmp|private|var|opt|Volumes|Applications|Library))(?:\/[\w.@-]+)+/g
const EPHEMERAL = /^(?:\/private)?\/tmp\/|^\/var\/folders\/|\/scratchpad(?:\/|$)/
const INCIDENT = /\b20\d\d-\d\d-\d\d\b|#\d{2,}/g

export const configDir = () => process.env.CLAUDE_CONFIG_DIR || join(homedir(), '.claude')
export const scratchDir = () => process.env.NOTWICE_SCRATCH_DIR || join(homedir(), '.t3', 'scratch')

const kindOf = (scope) => scope.split(':')[0]
const stemOf = (file) => basename(file, '.md')
const isMemory = (e) => basename(dirname(e.path)) === 'memory'
const frontmatter = (text) => text.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] ?? ''
const bodyOf = (text) => text.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, '')
const ruleLoads = (file) => (/^paths:/m.test(frontmatter(readText(file) ?? '')) ? 'on-demand' : 'always')
const round = (n) => Math.round(n * 10) / 10

function headText(file) {
  const fd = openSync(file, 'r')
  const buffer = Buffer.alloc(TRANSCRIPT_HEAD)
  const read = readSync(fd, buffer, 0, buffer.length, 0)
  closeSync(fd)
  return buffer.subarray(0, read).toString('utf8')
}

function cwdOf(dir) {
  const newestFirst = readNames(dir, '.jsonl').map((name) => join(dir, name)).sort((a, b) => statSync(b).mtimeMs - statSync(a).mtimeMs)
  for (const file of newestFirst) {
    const cwd = headText(file).match(/"cwd":("(?:[^"\\]|\\.)*")/)?.[1]
    if (cwd) return parseJson(cwd, null)
  }
  return null
}

function placeOf(path) {
  if (!path || !existsSync(path)) return { scope: 'orphan' }
  const worktreeOf = readText(join(path, '.git'))?.match(/^gitdir:\s*(.+?)\/\.git\/worktrees\//m)?.[1]
  if (worktreeOf) return { scope: 'orphan', root: worktreeOf }
  const inScratch = !existsSync(join(path, '.git')) && !relative(scratchDir(), path).startsWith('..')
  return { scope: inScratch ? 'thread' : `project:${basename(path)}`, root: path }
}

function entry(file, id, scope, loads, home) {
  const text = readText(file) ?? ''
  const index = loads === 'index'
  const loaded = index ? text.split('\n').slice(0, INDEX_LIMITS.lines).join('\n') : text
  const bytes = Math.min(Buffer.byteLength(loaded), index ? INDEX_LIMITS.bytes : Infinity)
  const age = Math.floor((Date.now() - statSync(file).mtimeMs) / DAY_MS)
  return { id, path: file, scope, loads: index ? 'always' : loads, tokens: Math.round(bytes / 4), age, copies: 0, text, index, home }
}

function globalEntries(dir) {
  const rules = readNames(join(dir, 'rules'), '.md').map((name) => join(dir, 'rules', name))
  const claude = readNames(dir).filter((name) => /^CLAUDE\.md/.test(name))
  return [
    ...rules.map((file) => entry(file, `rules/${basename(file)}`, 'global', ruleLoads(file))),
    ...claude.map((name) => entry(join(dir, name), name, 'global', name === 'CLAUDE.md' ? 'always' : 'never')),
  ]
}

function instructionEntries(root, scope) {
  const found = INSTRUCTION_FILES.filter((file) => existsSync(join(root, file)))
  const rules = readNames(join(root, '.claude', 'rules'), '.md').map((file) => `.claude/rules/${file}`)
  const files = [...found.map((file) => [file, 'always']), ...rules.map((file) => [file, ruleLoads(join(root, file))])]
  const imported = found.some((file) => /(?:^|\s)@AGENTS\.md\b/m.test(readText(join(root, file))))
  if (existsSync(join(root, 'AGENTS.md'))) files.push(['AGENTS.md', !found.length || imported ? 'always' : 'on-demand'])
  return files.map(([file, loads]) => entry(join(root, file), `${basename(root)}/${file}`, scope, loads, basename(root)))
}

function folderEntries(dir) {
  const path = cwdOf(dir)
  const { scope, root } = placeOf(path)
  const name = basename(path ?? dir)
  const loadsOf = (file) => (scope === 'orphan' ? 'never' : file === 'MEMORY.md' ? 'index' : 'on-demand')
  const memoryEntry = (file) => entry(join(dir, 'memory', file), `${name}/${stemOf(file)}`, scope, loadsOf(file), name)
  const memory = readNames(join(dir, 'memory'), '.md').map(memoryEntry)
  const rootScope = scope === 'thread' ? scope : `project:${basename(root ?? '')}`
  return [...memory, ...(root && existsSync(root) ? instructionEntries(root, rootScope) : [])]
}

function uniqueFiles(entries) {
  const paths = new Set()
  const firstCopy = new Map()
  return entries.filter((e) => {
    if (paths.has(e.path)) return false
    paths.add(e.path)
    if (!e.home || isMemory(e)) return true
    const first = firstCopy.get(e.text)
    if (first) first.copies++
    else firstCopy.set(e.text, e)
    return !first
  })
}

const fromOf = (rule) => frontmatter(readText(rule.file) ?? '').match(/^from:(.*)$/m)?.[1] ?? ''

function citesFile(from, stem) {
  const bareNameCounts = stem.includes('-')
  const names = bareNameCounts ? [`${stem}.md`, stem] : [`${stem}.md`]
  return from.split(/[\s(),;]+/).some((word) => names.includes(word.split('/').pop()))
}

function notwiceRules(locations) {
  const parsed = (location, state) => loadDir(join(location.dir, state)).filter((e) => e.rule)
  const inState = (location, state) => parsed(location, state).map(({ rule }) => ({ id: rule.id, from: fromOf(rule), state }))
  return locations.flatMap((location) => [...inState(location, 'rules'), ...inState(location, 'proposed')])
}

function addEvidence(entries, locations) {
  const rules = notwiceRules(locations)
  const fires = recentFires()
  const failures = readJsonl('failures.jsonl')
  for (const e of entries) {
    e.backed = e.index ? [] : rules.filter((rule) => citesFile(rule.from, stemOf(e.path))).map(({ id, state }) => ({ id, state }))
    const ids = new Set(e.backed.map((rule) => rule.id))
    e.fires = fires.filter((event) => ids.has(event.rule)).length
    const linked = failures.filter((record) => ids.has(record.rule_or_check)).length
    e.recurApprox = !linked
    e.recur = linked || new Set(bodyOf(e.text).match(INCIDENT)).size
  }
}

function shingles(text) {
  const words = bodyOf(text).toLowerCase().match(/[\p{L}\p{N}']+/gu) ?? []
  return new Set(words.slice(2).map((word, i) => `${words[i]} ${words[i + 1]} ${word}`))
}

function overlaps(a, b) {
  const shared = [...a].filter((s) => b.has(s)).length
  return shared >= DUP.shared && shared / Math.min(a.size, b.size) >= DUP.ratio
}

function missingPaths(text) {
  return [...text.matchAll(PATH)]
    .filter((m) => !/[<{*$]/.test(text[m.index + m[0].length] ?? ''))
    .map((m) => m[0].replace(/\.+$/, ''))
    .filter((path) => !existsSync(path.replace(/^~/, homedir())))
}

function addFlags(entries) {
  const names = new Set(entries.flatMap((e) => [stemOf(e.path), frontmatter(e.text).match(/^name:\s*(\S+)/m)?.[1]]))
  const sets = entries.map((e) => (e.index ? new Set() : shingles(e.text)))
  for (const [i, e] of entries.entries()) {
    e.dups = entries.filter((_, j) => j !== i && overlaps(sets[i], sets[j]))
    const links = [...e.text.matchAll(/\[\[([^\]]+)\]\]/g)].map((m) => m[1]).filter((link) => !names.has(link))
    e.flags = [
      ...(e.copies ? [`copies:${e.copies}`] : []),
      ...e.dups.map((other) => `dup:${other.id}`),
      ...missingPaths(e.text).map((path) => (EPHEMERAL.test(path) ? `ephemeral:${path}` : `stale:${path}`)),
      ...links.map((link) => `dangling:[[${link}]]`),
      ...(isMemory(e) && !e.index && GLOBAL_HINT.test(bodyOf(e.text)) ? ['global-fact'] : []),
    ]
  }
}

function suggestions(e) {
  const kind = kindOf(e.scope)
  const rulesDir = tilde(join(configDir(), 'rules'))
  const path = tilde(e.path)
  const actions = []
  if (kind === 'orphan') actions.push(`Rescue or delete ${path}: no session loads it.`)
  if (kind === 'global' && e.loads === 'never') actions.push(`Delete ${path}: it never loads.`)
  if (kind === 'thread' && isMemory(e) && !e.index) {
    actions.push(`Move ${path} into ${rulesDir} or a project memory if other sessions need it: only one scratch thread loads it.`)
  }
  if (kind === 'project' && e.flags.includes('global-fact')) actions.push(`Promote ${path} into ${rulesDir} if it applies to every project.`)
  for (const other of e.dups.filter((other) => e.loads !== 'never' && other.loads !== 'never')) {
    const otherGlobal = kindOf(other.scope) === 'global'
    if (otherGlobal && kind !== 'global') actions.push(`Delete ${path}: it repeats ${tilde(other.path)}.`)
    else if (otherGlobal === (kind === 'global') && e.id < other.id) {
      actions.push(`Keep one of ${path} and ${tilde(other.path)}, or merge them: they share most of their text.`)
    }
  }
  for (const f of e.flags.filter((f) => /^(?:stale|ephemeral):/.test(f))) actions.push(`Fix ${path}: ${f.replace(/^\w+:/, '')} no longer exists.`)
  for (const f of e.flags.filter((f) => f.startsWith('dangling:'))) actions.push(`Fix ${path}: write the memory ${f.slice(9)} or drop the link.`)
  if (e.recur >= ENFORCE_AT && !e.backed.length && !e.index) {
    actions.push(`Enforce ${path}: it cites ${e.recur} incidents; ask the learn skill to draft a rule from it, then run notwice propose.`)
  }
  return actions
}

function scored(e) {
  const parts = {
    recur: round(3 * Math.log2(1 + e.recur)),
    fires: round(2 * Math.log2(1 + e.fires)),
    scope: SCOPE_WEIGHT[kindOf(e.scope)],
    recency: e.age <= 14 ? 1 : e.age > 60 && !e.fires ? -1 : 0,
  }
  return { score: round(parts.recur + parts.fires + parts.scope + parts.recency), parts }
}

function alwaysOn(entries) {
  const sums = { global: 0 }
  for (const e of entries.filter((e) => e.loads === 'always')) {
    const where = e.home ? `${kindOf(e.scope)}:${e.home}` : 'global'
    sums[where] = (sums[where] ?? 0) + e.tokens
  }
  return Object.fromEntries(Object.entries(sums).map(([where, tokens]) => [where, where === 'global' ? tokens : tokens + sums.global]))
}

export function inventory(locations) {
  const dir = configDir()
  const folders = readNames(join(dir, 'projects')).map((name) => join(dir, 'projects', name))
  const entries = uniqueFiles([...globalEntries(dir), ...folders.flatMap(folderEntries)])
  addEvidence(entries, locations)
  addFlags(entries)
  const order = Object.keys(SCOPE_WEIGHT)
  const rows = entries.map(({ text, dups, index, home, ...e }) => ({ ...e, ...scored(e), suggest: suggestions({ ...e, dups, index }) }))
  rows.sort((a, b) => order.indexOf(kindOf(a.scope)) - order.indexOf(kindOf(b.scope)) || b.score - a.score || a.id.localeCompare(b.id))
  return { configDir: dir, scratchDir: scratchDir(), alwaysOn: alwaysOn(entries), entries: rows }
}

const clip = (text, max = 44) => (text.length > max ? `${text.slice(0, 16)}…${text.slice(17 - max)}` : text)

const COLUMNS = [
  ['score', (e) => e.score.toFixed(1)],
  ['id', (e) => clip(e.id)],
  ['scope', (e) => clip(e.scope, 24)],
  ['loads', (e) => e.loads],
  ['~tok', (e) => String(e.tokens)],
  ['age', (e) => `${e.age}d`],
  ['backed', (e) => e.backed.map((rule) => (rule.state === 'proposed' ? `${rule.id}?` : rule.id)).join(',') || 'prose'],
  ['fires', (e) => String(e.fires)],
  ['recur', (e) => `${e.recurApprox ? '~' : ''}${e.recur}`],
  ['why', (e) => Object.entries(e.parts).filter(([, n]) => n).map(([part, n]) => `${part}${n > 0 ? '+' : ''}${n}`).join(' ')],
  ['flags', (e) => e.flags.join(' ')],
]

const LEGEND = '"?" marks a proposed rule; "~" marks a recurrence counted from the file\'s own dates and PR numbers.'

export function formatInventory({ configDir: dir, alwaysOn: totals, entries }) {
  const rows = [COLUMNS.map(([title]) => title), ...entries.map((e) => COLUMNS.map(([, cell]) => cell(e)))]
  const widths = COLUMNS.map((_, i) => Math.max(...rows.map((row) => row[i].length)))
  const line = (row) => row.map((cell, i) => cell.padEnd(widths[i])).join('  ').trimEnd()
  const table = rows.map((row, i) => (i > 1 && kindOf(row[2]) !== kindOf(rows[i - 1][2]) ? `\n${line(row)}` : line(row)))
  const sessions = Object.entries(totals).filter(([where]) => where !== 'global').sort((a, b) => b[1] - a[1])
  const actions = entries.flatMap((e) => e.suggest)
  return [
    `${entries.length} files that Claude Code agents load or can read, in ${dir}. Nothing was changed.`,
    LEGEND,
    '',
    ...table,
    '',
    `Always-on tokens in a new session: ${totals.global} anywhere${sessions.slice(0, 5).map(([where, n]) => `, ${n} in ${where}`).join('')}.`,
    '',
    actions.length ? `Suggestions:\n${actions.map((a) => `- ${a}`).join('\n')}` : 'No suggestions.',
  ].join('\n')
}
