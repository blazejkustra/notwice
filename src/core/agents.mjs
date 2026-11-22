import { statSync } from 'node:fs'
import { basename, join } from 'node:path'
import { git } from './git.mjs'
import { createSessionFile, groupBy, home, logAgent, readJsonl, readNames, sessionPath, tilde, touchSessionFile } from './store.mjs'

const STALE_MS = 30 * 60 * 1000
const UNITS = [['d', 86400], ['h', 3600], ['m', 60], ['s', 1]]

const clip = (text) => (text ?? '').replace(/\s+/g, ' ').trim().slice(0, 120)
const shorten = (text, max) => (text.length > max ? `${text.slice(0, max - 1)}…` : text)

export function parentSession({ session }) {
  const parent = process.env.NOTWICE_SESSION
  return parent && parent !== session ? parent : undefined
}

const LINES = {
  'session.start': startLine,
  prompt: (e) => isFirstTask(e) && { e: 'task', text: clip(e.prompt) },
  'tool.before': ({ sub, tool: { spawn } }) => spawn && { e: 'spawn', by: sub?.id, use: spawn.use, type: spawn.type, desc: clip(spawn.desc) },
  'tool.after': ({ tool: { spawn } }) => spawn?.id && { e: 'spawned', use: spawn.use, id: spawn.id, bg: spawn.bg },
  'shell.after': prLine,
  'subagent.start': ({ sub }) => sub?.type && { e: 'sub', id: sub.id, type: sub.type },
  'subagent.stop': ({ sub }) => ({ e: 'done', id: sub?.id }),
  'session.end': (e) => ({ e: 'end', reason: e.reason }),
}

function startLine(event) {
  const { agent, cwd, source } = event
  return { e: 'start', agent, cwd, branch: branchOf(cwd), parent: parentSession(event), t3: process.env.T3CODE_THREAD_ID, src: source }
}

export function track(event) {
  touchSessionFile(event.session, 'beat')
  const line = LINES[event.type]?.(event)
  if (line) logAgent({ s: event.session, ...line })
}

export function trackTurn(event, unmet) {
  logAgent({ e: 'turn', s: event.session, unmet, bg: event.turn.background, branch: branchOf(event.cwd) })
}

const branchOf = (cwd) => git(cwd, 'symbolic-ref', '--short', '-q', 'HEAD')?.trim()
const isFirstTask = (e) => !(e.prompt ?? '').startsWith('<task-notification>') && createSessionFile(e.session, 'task')

function prLine({ sub, shell }) {
  const url = /\bgh\s+pr\s+create\b/.test(shell.command) && shell.output?.match(/https?:\/\/\S+\/pull\/\d+/)?.[0]
  return url && { e: 'pr', by: sub?.id, url }
}

export function formatAgents({ since }) {
  const events = readNames(join(home(), 'agents'), '.jsonl').flatMap((name) => readJsonl(join('agents', name)))
  const rows = [...groupBy(events, (e) => e.s)].map(([id, list]) => sessionRow(id, list))
  const recent = rows.filter((r) => r.active >= since).sort((a, b) => b.active - a.active)
  const recentIds = new Set(recent.map((r) => r.id))
  const top = recent.filter((r) => !recentIds.has(r.parent))
  if (!top.length) return `No sessions in that time. Hooks record them in ${join(home(), 'agents')}.`
  const blocks = blockCounts()
  const lines = []
  for (const [place, group] of groupBy(top, placeOf)) {
    lines.push(place)
    renderChildren(group.map((row) => sessionNode(row, rows, blocks)), '', lines)
  }
  return lines.join('\n')
}

function sessionRow(id, list) {
  const start = list.find((e) => e.e === 'start') ?? {}
  const turn = list.findLast((e) => e.e === 'turn')
  const beat = statSync(sessionPath(id, 'beat'), { throwIfNoEntry: false })?.mtimeMs ?? list.at(-1).at
  return {
    id, cwd: start.cwd, branch: turn?.branch ?? start.branch, parent: start.parent, agent: start.agent === 'claude' ? null : start.agent,
    task: list.find((e) => e.e === 'task')?.text,
    prs: list.filter((e) => e.e === 'pr').map((e) => `PR #${e.url.split('/').pop()}`),
    unmet: turn?.unmet,
    state: stateOf(list, turn, beat),
    active: Math.max(beat, list.at(-1).at),
    subs: subagents(list),
  }
}

function stateOf(list, turn, beat) {
  if (list.some((e) => e.e === 'end')) return 'ended'
  if (turn && !turn.bg && beat <= turn.at) return 'idle'
  if (Date.now() - beat > STALE_MS) return 'stale'
  return turn?.bg ? 'waiting' : 'working'
}

function subagents(list) {
  const exact = new Map(list.filter((e) => e.e === 'spawned').map((e) => [e.id, e]))
  const spawns = list.filter((e) => e.e === 'spawn')
  const paired = new Set([...exact.values()].map((e) => e.use))
  const subs = new Map()
  for (const sub of list.filter((e) => e.e === 'sub')) {
    if (subs.has(sub.id)) continue
    const use = exact.get(sub.id)?.use ?? spawns.find((s) => s.type === sub.type && !paired.has(s.use))?.use
    paired.add(use)
    const spawn = spawns.find((s) => s.use === use) ?? {}
    const done = list.find((e) => e.e === 'done' && e.id === sub.id)
    subs.set(sub.id, { id: sub.id, type: sub.type, desc: spawn.desc, by: spawn.by, bg: exact.get(sub.id)?.bg, started: sub.at, done: done?.at })
  }
  return [...subs.values()]
}

function sessionNode(row, rows, blocks, label) {
  const verify = row.unmet?.length ? `verify: ${row.unmet.join(', ')} unmet` : row.unmet && 'verify ok'
  const task = row.task && `"${shorten(row.task, 60)}"`
  const state = `${row.state} ${ago(row.active)}`.padEnd(11)
  const text = cells([row.id.slice(0, 8), label ?? row.agent, state, task, ...row.prs, verify, blockText(blocks.get(row.id))])
  const known = new Set(row.subs.map((s) => s.id))
  const children = [
    ...row.subs.filter((s) => !known.has(s.by)).map((s) => subagentNode(s, row.subs, blocks)),
    ...rows.filter((r) => r.parent === row.id).map((r) => sessionNode(r, rows, blocks, 'session')),
  ]
  return { text, children }
}

function subagentNode(sub, subs, blocks) {
  const state = sub.done ? `done ${ago(sub.done)}` : `running ${ago(sub.started)}`
  const text = cells([sub.id.slice(0, 8), sub.type, state.padEnd(11), sub.bg && 'bg', sub.desc, blockText(blocks.get(sub.id))])
  return { text, children: subs.filter((s) => s.by === sub.id).map((s) => subagentNode(s, subs, blocks)) }
}

function renderChildren(children, indent, lines) {
  children.forEach((child, i) => {
    const last = i === children.length - 1
    lines.push(`${indent}${last ? '└' : '├'} ${child.text}`)
    renderChildren(child.children, `${indent}${last ? ' ' : '│'} `, lines)
  })
}

function blockCounts() {
  const counts = new Map()
  for (const entry of readJsonl('log.jsonl').filter((e) => e.blocked)) {
    for (const key of [entry.session, entry.agent].filter(Boolean)) counts.set(key, (counts.get(key) ?? 0) + 1)
  }
  return counts
}

const placeOf = (row) => (row.cwd ? `${basename(row.cwd)}  ${row.branch ?? '(detached)'}  ${tilde(row.cwd)}` : '(started before tracking)')
const cells = (parts) => parts.filter(Boolean).join('  ')
const blockText = (n) => n && `${n} block${n > 1 ? 's' : ''}`

function ago(at) {
  const seconds = Math.max(0, Math.round((Date.now() - at) / 1000))
  const [unit, size] = UNITS.find(([, size]) => seconds >= size) ?? UNITS.at(-1)
  return `${Math.floor(seconds / size)}${unit}`
}
