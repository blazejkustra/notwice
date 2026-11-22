import { handle as decide } from '../core/engine.mjs'
import { writeHome } from '../core/store.mjs'

const EDIT_TOOLS = new Set(['Edit', 'Write', 'MultiEdit', 'NotebookEdit'])
export const EVENTS = {
  SessionStart: 'session.start', UserPromptSubmit: 'prompt', SubagentStart: 'subagent.start', SubagentStop: 'subagent.stop',
  Stop: 'turn.end', SessionEnd: 'session.end',
}

export function handle(input) {
  const envFile = process.env.CLAUDE_ENV_FILE
  const exportable = input.hook_event_name === 'SessionStart' && envFile && /^[\w-]+$/.test(input.session_id)
  if (exportable) writeHome(envFile, `export NOTWICE_SESSION=${input.session_id}\n`)
  return reply(decide(toEvent(input)), input.hook_event_name)
}

export function toEvent(input) {
  const { hook_event_name: name, tool_name: tool, tool_input: given = {}, tool_response: response = {} } = input
  const sub = input.agent_id ? { id: input.agent_id, type: input.agent_type } : null
  const running = (input.background_tasks ?? []).filter((t) => t.status === 'running').length
  return {
    agent: 'claude', type: typeOf(name, tool), session: input.session_id, cwd: input.cwd, sub,
    worker: Boolean(sub || given.run_in_background),
    source: input.source, prompt: input.prompt, reason: input.reason, path: given.file_path,
    shell: shellOf(name, given, response),
    edit: { files: [{ path: given.file_path ?? given.notebook_path, added: introducedLines(input) }] },
    tool: toolOf(input),
    turn: turnOf(input, running),
  }
}

function shellOf(name, given, response) {
  const exit = name === 'PostToolUse' && !response.interrupted ? 0 : null
  return { command: given.command ?? '', background: Boolean(given.run_in_background), exit, output: response.stdout }
}

export const turnOf = (input, background) => ({ reply: input.last_assistant_message ?? '', retry: Boolean(input.stop_hook_active), background })

function typeOf(name, tool) {
  if (name !== 'PreToolUse' && name !== 'PostToolUse') return EVENTS[name]
  const phase = name === 'PreToolUse' ? 'before' : 'after'
  if (EDIT_TOOLS.has(tool)) return `edit.${phase}`
  if (tool === 'Bash') return `shell.${phase}`
  return tool === 'Read' ? `read.${phase}` : `tool.${phase}`
}

function toolOf({ tool_name: name, tool_input: given = {}, tool_response: response = {}, tool_use_id: use }) {
  if (name !== 'Agent') return { name: given.role && given.title ? `${name}(${given.role}): ${given.title}` : name, ok: true }
  const type = given.subagent_type ?? 'general-purpose'
  const spawn = { use, type, desc: given.description, id: response.agentId, bg: response.status === 'async_launched' }
  return { name: type === 'fork' ? null : `Agent(${type}): ${given.description ?? ''}`, ok: response.status === 'completed', spawn }
}

function introducedLines({ tool_input: given = {}, tool_response: response = {} }) {
  if (response.structuredPatch?.length) return patchLines(response.structuredPatch)
  const edits = given.edits?.map((e) => e.new_string).join('\n')
  const text = given.content ?? given.new_string ?? given.new_source ?? edits ?? ''
  return text.split('\n').map((t, i) => ({ line: i + 1, text: t }))
}

function patchLines(hunks) {
  const removed = new Set(hunks.flatMap((h) => h.lines.filter((l) => l.startsWith('-')).map((l) => l.slice(1).trim())))
  const lines = []
  for (const hunk of hunks) {
    let next = hunk.newStart
    for (const line of hunk.lines) {
      if (line.startsWith('+') && !removed.has(line.slice(1).trim())) lines.push({ line: next, text: line.slice(1) })
      if (line.startsWith('+') || line.startsWith(' ')) next++
    }
  }
  return lines
}

export function reply(decision, name) {
  if (!decision) return null
  if (decision.action === 'deny') {
    return { hookSpecificOutput: { hookEventName: name, permissionDecision: 'deny', permissionDecisionReason: decision.message } }
  }
  if (decision.action !== 'context') return { decision: 'block', reason: decision.message }
  const output = { hookSpecificOutput: { hookEventName: name, additionalContext: decision.context } }
  if (decision.message) output.systemMessage = decision.message
  return output
}
