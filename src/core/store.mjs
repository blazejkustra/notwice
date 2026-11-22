import { createHash } from 'node:crypto'
import { mkdirSync, readdirSync, readFileSync, renameSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { basename, dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseEntry } from './rules.mjs'

export const STATES = ['proposed', 'rules', 'retired']
export const DAY_MS = 24 * 60 * 60 * 1000
export const BUILTIN_DIR = fileURLToPath(new URL('../../builtin', import.meta.url))
export const STARTER_DIR = fileURLToPath(new URL('../../starter', import.meta.url))
const PARSER = fileURLToPath(new URL('./rules.mjs', import.meta.url))

export const home = () => process.env.NOTWICE_HOME || join(homedir(), '.notwice')
export const tilde = (path) => (path.startsWith(`${homedir()}/`) ? `~${path.slice(homedir().length)}` : path)

export const locations = (root) => [{ name: 'personal', dir: home() }, ...(root ? [{ name: 'project', dir: join(root, '.notwice') }] : [])]

export function attempt(fn, fallback = null) {
  try {
    return fn()
  } catch {
    return fallback
  }
}

export function groupBy(list, key) {
  const groups = new Map()
  for (const item of list) {
    if (!groups.has(key(item))) groups.set(key(item), [])
    groups.get(key(item)).push(item)
  }
  return groups
}

export const readText = (path) => attempt(() => readFileSync(path, 'utf8'))
export const parseJson = (text, fallback) => attempt(() => JSON.parse(text) ?? fallback, fallback)
export const readNames = (dir, suffix = '') => attempt(() => readdirSync(dir).filter((name) => name.endsWith(suffix)).sort(), [])

export const loadFile = (file) => parseEntry(readText(file) ?? '', file)
export const loadDir = (dir) => readNames(dir, '.md').map((name) => loadFile(join(dir, name)))

export function loadRules(root) {
  const sources = [
    [loadDir(BUILTIN_DIR), 'built-in'],
    [loadIndexed(join(home(), 'rules')), 'personal'],
    [root ? loadDir(join(root, '.notwice', 'rules')) : [], 'project'],
  ]
  return uniqueRules(sources.flatMap(([entries, source]) => entries.map((entry) => ({ ...entry, source }))))
}

const toJson = (key, value) => (value instanceof RegExp ? { re: value.source, flags: value.flags } : value)
const fromJson = (key, value) => (value?.re == null ? value : new RegExp(value.re, value.flags))

function loadIndexed(dir) {
  const names = readNames(dir, '.md')
  const stamp = [PARSER, ...names.map((name) => join(dir, name))].map(fileStamp).join('\n')
  const index = join(dir, '.index.json')
  const saved = attempt(() => JSON.parse(readText(index), fromJson))
  if (saved?.stamp === stamp) return saved.entries
  const entries = names.map((name) => loadFile(join(dir, name)))
  if (entries.length && entries.every((e) => e.rule)) writeAtomic(index, JSON.stringify({ stamp, entries }, toJson))
  return entries
}

function fileStamp(file) {
  const stat = statSync(file, { throwIfNoEntry: false })
  return `${basename(file)} ${stat?.mtimeMs} ${stat?.size}`
}

export function uniqueRules(entries) {
  const seen = new Set()
  const rules = []
  for (const { rule, error, source } of entries) {
    if (error) logError(error)
    if (!rule || seen.has(rule.id)) continue
    seen.add(rule.id)
    rules.push({ ...rule, source, locked: rule.locked || source === 'built-in' })
  }
  return rules
}

export function writeHome(name, text, flag = 'a') {
  const file = resolve(home(), name)
  return attempt(() => {
    mkdirSync(dirname(file), { recursive: true })
    writeFileSync(file, text, { flag })
    return true
  }, false)
}

const appendJson = (name, value) => writeHome(name, `${JSON.stringify(value)}\n`)
export const log = (entry) => appendJson('log.jsonl', { ts: new Date().toISOString(), ...entry })
export const logError = (error) => writeHome('errors.log', `${new Date().toISOString()} ${error?.stack ?? error}\n`)
export const recordFailure = (record) => appendJson('failures.jsonl', { date: new Date().toLocaleDateString('sv'), ...record })

export function readJsonl(name) {
  const lines = (readText(join(home(), name)) ?? '').split('\n').filter(Boolean)
  return lines.map((line) => parseJson(line, null)).filter(Boolean)
}

export const recentFires = () => readJsonl('log.jsonl').filter((e) => e.type === 'violation' && Date.now() - Date.parse(e.ts) < 30 * DAY_MS)

const approvedFile = () => join(home(), 'rules', '.approved')

export function rulesHash() {
  const dir = join(home(), 'rules')
  const hash = createHash('sha256')
  for (const name of readNames(dir, '.md')) hash.update(`${name}\0${readText(join(dir, name))}\0`)
  return hash.digest('hex')
}

export const recordRulesHash = () => attempt(() => writeFileSync(approvedFile(), rulesHash()))

export function rulesChanged() {
  const saved = readText(approvedFile())
  return saved != null && saved.trim() !== rulesHash()
}

const sessionName = (session, ext) => join('sessions', `${createHash('sha1').update(String(session)).digest('hex')}.${ext}`)
export const sessionPath = (session, ext) => join(home(), sessionName(session, ext))

export const readEvents = (session) => readJsonl(sessionName(session, 'events.jsonl'))
export const appendEvent = (session, event) => appendJson(sessionName(session, 'events.jsonl'), event)
export const touchSessionFile = (session, ext) => writeHome(sessionName(session, ext), '', 'w')
export const createSessionFile = (session, ext) => writeHome(sessionName(session, ext), '', 'wx')
export const logAgent = (event) => appendJson(join('agents', `${new Date().toISOString().slice(0, 7)}.jsonl`), { at: Date.now(), ...event })

const snapshotFile = (session, root) => join(home(), 'sessions', `${createHash('sha1').update(`${session}\0${root}`).digest('hex')}.json`)

export const readSnapshot = (session, root) => parseJson(readText(snapshotFile(session, root)), null)

export const writeSnapshot = (session, root, snapshot) => writeAtomic(snapshotFile(session, root), JSON.stringify(snapshot))

function writeAtomic(file, text) {
  attempt(() => {
    mkdirSync(dirname(file), { recursive: true })
    writeFileSync(`${file}.${process.pid}`, text)
    renameSync(`${file}.${process.pid}`, file)
  })
}

export function prune(folder, maxAgeMs) {
  const dir = join(home(), folder)
  for (const name of readNames(dir)) {
    const file = join(dir, name)
    attempt(() => Date.now() - statSync(file).mtimeMs > maxAgeMs && rmSync(file, { force: true }))
  }
}
