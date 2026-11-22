import { closeSync, fstatSync, openSync, readSync } from 'node:fs'
import { handle as decide } from '../core/engine.mjs'
import { attempt, parseJson } from '../core/store.mjs'
import { EVENTS, reply, turnOf } from './claude.mjs'
import { patchFiles } from './patch.mjs'

const KINDS = { Bash: 'shell', apply_patch: 'edit' }
const TRANSCRIPT_TAIL = 2 * 1024 * 1024

export const handle = (input) => reply(decide(toEvent(input)), input.hook_event_name)

export function toEvent(input) {
  const { hook_event_name: name, tool_name: tool, tool_input: given = {}, tool_response: response } = input
  const phase = { PreToolUse: 'before', PostToolUse: 'after' }[name]
  const kind = KINDS[tool] ?? 'tool'
  const sub = input.agent_id ? { id: input.agent_id, type: input.agent_type } : null
  const exit = phase === 'after' && kind === 'shell' ? exitCode(input) : null
  const failedPatch = phase === 'after' && /^Exit code: [1-9]/.test(response ?? '')
  const files = kind === 'edit' && !failedPatch ? patchFiles(given.command ?? '', input.cwd, phase === 'after') : []
  return {
    agent: 'codex', type: phase ? `${kind}.${phase}` : EVENTS[name], session: input.session_id, cwd: input.cwd, sub, worker: Boolean(sub),
    caps: { mainVsWorker: false }, source: input.source, prompt: input.prompt, reason: input.reason,
    shell: { command: given.command ?? '', background: false, exit, output: typeof response === 'string' ? response : '' },
    edit: { files },
    tool: { name: tool, ok: true },
    turn: turnOf(input, 0),
  }
}

function exitCode({ transcript_path: path, tool_use_id: use }) {
  const line = readTail(path).split('\n').findLast((l) => l.includes('"item_completed"') && l.includes(`"id":"${use}"`))
  return parseJson(line ?? '', null)?.payload?.item?.exit_code ?? null
}

function readTail(path) {
  const fd = attempt(() => openSync(path, 'r'))
  if (fd == null) return ''
  const size = attempt(() => fstatSync(fd).size, 0)
  const buffer = Buffer.alloc(Math.min(size, TRANSCRIPT_TAIL))
  attempt(() => readSync(fd, buffer, 0, buffer.length, size - buffer.length))
  closeSync(fd)
  return buffer.toString('utf8')
}
