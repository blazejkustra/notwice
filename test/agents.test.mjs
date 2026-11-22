import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, readdirSync, readFileSync, utimesSync } from 'node:fs'
import { basename, join } from 'node:path'
import { test } from 'node:test'
import { DAY_MS } from '../src/core/store.mjs'
import { ROOT, hook, makeHome, makeRepo, notwice, tempDir, write } from './helpers.mjs'

const MAIN = 'aaaa1111-2222-4333-8444-555566667777'
const CHILD = 'bbbb1111-2222-4333-8444-555566667777'
const [IMPL, FIND, CI] = ['a1a1a1a1b2b2b2b2c', 'a2a2a2a2b2b2b2b2c', 'a3a3a3a3b2b2b2b2c']
const agentLines = (home) => readdirSync(join(home, 'agents')).flatMap((name) => readFileSync(join(home, 'agents', name), 'utf8').split('\n').filter(Boolean))
const beatFile = (home, session) => join(home, 'sessions', `${createHash('sha1').update(session).digest('hex')}.beat`)

function setMtime(file, ageMs) {
  const when = new Date(Date.now() - ageMs)
  utimesSync(file, when, when)
}

function runWorker(home, worker) {
  const script = join(ROOT, 'test', 'fixtures', 'append-agent-lines.mjs')
  const child = spawn(process.execPath, [script, String(worker), '100'], { env: { ...process.env, NOTWICE_HOME: home }, stdio: 'ignore' })
  return new Promise((resolve) => child.on('exit', resolve))
}

test('50 processes appending 100 lines each at once leave 5,000 whole lines', async () => {
  const home = tempDir('notwice-home-')
  await Promise.all(Array.from({ length: 50 }, (_, worker) => runWorker(home, worker)))
  const events = agentLines(home).map((line) => JSON.parse(line))
  assert.equal(events.length, 5000)
  for (let worker = 0; worker < 50; worker++) assert.equal(events.filter((e) => e.s === `worker-${worker}`).length, 100)
})

test('SessionStart deletes agent logs after 60 days and session files after 7', () => {
  const home = makeHome()
  const files = {
    oldLog: write(home, 'agents/2026-01.jsonl', '{}\n'),
    recentLog: write(home, 'agents/2026-10.jsonl', '{}\n'),
    oldBeat: write(home, 'sessions/old.beat', ''),
    recentBeat: write(home, 'sessions/recent.beat', ''),
  }
  setMtime(files.oldLog, 61 * DAY_MS)
  setMtime(files.recentLog, 30 * DAY_MS)
  setMtime(files.oldBeat, 8 * DAY_MS)
  setMtime(files.recentBeat, 2 * DAY_MS)
  hook({ hook_event_name: 'SessionStart', source: 'startup', cwd: makeRepo() }, { home })
  assert.deepEqual(Object.entries(files).map(([name, file]) => [name, existsSync(file)]), [['oldLog', false], ['recentLog', true], ['oldBeat', false], ['recentBeat', true]])
})

test('notwice agents shows sessions, nested subagents, background work, PRs, blocks and child sessions', () => {
  const home = makeHome()
  const repo = makeRepo()
  const send = (input, session = MAIN, env) => hook({ cwd: repo, session_id: session, ...input }, { home, env })
  const spawnAgent = (use, input, by = {}) => send({ hook_event_name: 'PreToolUse', tool_name: 'Agent', tool_use_id: use, tool_input: input, ...by })
  const agentResult = (use, input, response, by = {}) => send({ hook_event_name: 'PostToolUse', tool_name: 'Agent', tool_use_id: use, tool_input: input, tool_response: response, ...by })
  const inImpl = { agent_id: IMPL, agent_type: 'general-purpose' }
  const implTask = { description: 'Implement the slug fix', prompt: 'x', subagent_type: 'general-purpose' }
  const findTask = { description: 'Find slug callers', prompt: 'x', subagent_type: 'Explore' }
  const ciTask = { description: 'Wait for CI on #7', prompt: 'x', run_in_background: true }

  send({ hook_event_name: 'SessionStart', source: 'startup' })
  send({ hook_event_name: 'UserPromptSubmit', prompt: 'Fix the slug bug\nand open a PR' })
  send({ hook_event_name: 'UserPromptSubmit', prompt: 'And keep it small' })
  spawnAgent('u1', implTask)
  send({ hook_event_name: 'SubagentStart', ...inImpl })
  spawnAgent('u2', findTask, inImpl)
  send({ hook_event_name: 'SubagentStart', agent_id: FIND, agent_type: 'Explore' })
  send({ hook_event_name: 'PreToolUse', tool_name: 'Bash', tool_input: { command: 'gh pr close 5' }, ...inImpl })
  spawnAgent('u3', ciTask)
  send({ hook_event_name: 'SubagentStart', agent_id: CI, agent_type: 'general-purpose' })
  agentResult('u3', ciTask, { status: 'async_launched', agentId: CI })

  const running = notwice(['agents'], { home }).stdout.trimEnd().split('\n')
  assert.equal(running[0], `${basename(repo)}  feature  ${repo}`)
  assert.match(running[1], /^└ aaaa1111 {2}working \d+s\s+"Fix the slug bug and open a PR" {2}1 block$/)
  assert.match(running[2], /^ {2}├ a1a1a1a1 {2}general-purpose {2}running \d+s\s+Implement the slug fix {2}1 block$/)
  assert.match(running[3], /^ {2}│ └ a2a2a2a2 {2}Explore {2}running \d+s\s+Find slug callers$/)
  assert.match(running[4], /^ {2}└ a3a3a3a3 {2}general-purpose {2}running \d+s\s+bg {2}Wait for CI on #7$/)

  send({ hook_event_name: 'SubagentStop', agent_id: FIND, agent_type: 'Explore' })
  agentResult('u2', findTask, { status: 'completed', agentId: FIND }, inImpl)
  send({ hook_event_name: 'SubagentStop', ...inImpl })
  agentResult('u1', implTask, { status: 'completed', agentId: IMPL })
  send({ hook_event_name: 'PostToolUse', tool_name: 'Bash', tool_input: { command: 'gh pr create --fill' }, tool_response: { stdout: 'https://github.com/example/repo/pull/7\n' } })
  send({ hook_event_name: 'Stop', stop_hook_active: false, background_tasks: [{ id: CI, type: 'subagent', status: 'running' }] })
  const childEnv = { NOTWICE_SESSION: MAIN }
  send({ hook_event_name: 'SessionStart', source: 'startup' }, CHILD, childEnv)
  send({ hook_event_name: 'UserPromptSubmit', prompt: 'Reply ok' }, CHILD, childEnv)
  send({ hook_event_name: 'Stop', stop_hook_active: false }, CHILD, childEnv)
  send({ hook_event_name: 'SessionEnd', reason: 'other' }, CHILD, childEnv)

  const finished = notwice(['agents'], { home }).stdout.trimEnd().split('\n')
  assert.equal(finished.length, 6)
  assert.match(finished[1], /^└ aaaa1111 {2}waiting \d+s\s+"Fix the slug bug and open a PR" {2}PR #7 {2}verify ok {2}1 block$/)
  assert.match(finished[2], /^ {2}├ a1a1a1a1 {2}general-purpose {2}done \d+s\s+Implement the slug fix {2}1 block$/)
  assert.match(finished[3], /^ {2}│ └ a2a2a2a2 {2}Explore {2}done \d+s\s+Find slug callers$/)
  assert.match(finished[4], /^ {2}├ a3a3a3a3 {2}general-purpose {2}running \d+s\s+bg {2}Wait for CI on #7$/)
  assert.match(finished[5], /^ {2}└ bbbb1111 {2}session {2}ended \d+s\s+"Reply ok" {2}verify ok$/)
})

test('session states come from the last turn, background work and the activity beat, inside the time window', () => {
  const home = tempDir('notwice-home-')
  const now = Date.now()
  const start = (s, ageMs) => ({ e: 'start', s, at: now - ageMs, cwd: '/work/shop', branch: 'main' })
  const turn = (s, ageMs, bg = 0) => ({ e: 'turn', s, at: now - ageMs, bg })
  const events = [
    start('idle0000', 120e3), turn('idle0000', 60e3),
    start('work0000', 120e3), turn('work0000', 60e3),
    start('wait0000', 120e3), turn('wait0000', 60e3, 1),
    start('stal0000', 3600e3),
    start('ende0000', 120e3), { e: 'end', s: 'ende0000', at: now - 60e3 },
    start('olds0000', 3 * DAY_MS), turn('olds0000', 3 * DAY_MS),
    start('brch0000', 120e3), { e: 'task', s: 'brch0000', at: now - 120e3, text: 'x'.repeat(120) },
    { ...turn('brch0000', 60e3), cwd: '/work/shop', branch: 'feat/cli' },
  ]
  write(home, 'agents/2026-11.jsonl', events.map((e) => JSON.stringify(e)).join('\n') + '\n{"e":"turn","s":"torn')
  const beats = { idle0000: 61e3, work0000: 5e3, wait0000: 30e3, stal0000: 40 * 60e3, olds0000: 3 * DAY_MS + 1000 }
  for (const [session, ageMs] of Object.entries(beats)) setMtime(write(home, `sessions/${basename(beatFile(home, session))}`, ''), ageMs)
  const state = (out, s) => out.match(new RegExp(`${s} {2}(\\w+)`))?.[1]
  const day = notwice(['agents'], { home }).stdout
  assert.deepEqual(['idle0000', 'work0000', 'wait0000', 'stal0000', 'ende0000'].map((s) => state(day, s)), ['idle', 'working', 'waiting', 'stale', 'ended'])
  assert.equal(state(day, 'olds0000'), undefined)
  assert.equal(state(notwice(['agents', '--days', '7'], { home }).stdout, 'olds0000'), 'idle')
  assert.equal(state(notwice(['agents', '--all'], { home }).stdout, 'olds0000'), 'idle')
  assert.match(day, /^shop {2}main {2}\/work\/shop$/m)
  assert.match(day, /^shop {2}feat\/cli {2}\/work\/shop\n└ brch0000 {2}idle \d+\w\s+"x{59}…"$/m)
  assert.match(notwice(['agents'], { home: tempDir('notwice-home-') }).stdout, /^No sessions in that time\. Hooks record them in .*agents\.$/m)
})
