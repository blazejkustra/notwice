import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { test } from 'node:test'
import { reply, toEvent } from '../src/adapters/claude.mjs'
import { ROOT } from './helpers.mjs'

const PAYLOADS = JSON.parse(readFileSync(join(ROOT, 'test', 'fixtures', 'payloads', 'claude.json'), 'utf8'))
const pick = (event, keys) => Object.fromEntries(keys.map((k) => [k, event[k]]))

test('Claude Code payloads map to internal events', () => {
  const pre = toEvent(PAYLOADS.preBash)
  assert.deepEqual(pick(pre, ['agent', 'type', 'session', 'cwd', 'sub', 'worker']), { agent: 'claude', type: 'shell.before', session: PAYLOADS.preBash.session_id, cwd: '/repo', sub: null, worker: false })
  assert.equal(pre.shell.command, 'git push origin feat')
  assert.deepEqual(toEvent(PAYLOADS.postBash).shell, { command: 'npm test', background: false, exit: 0, output: 'ok 1\n' })
  assert.deepEqual(pick(toEvent(PAYLOADS.postBashBackground), ['worker']), { worker: true })
  assert.equal(toEvent(PAYLOADS.postBashBackground).shell.background, true)
  assert.equal(toEvent(PAYLOADS.postBashFailure).type, undefined)
  const edit = toEvent(PAYLOADS.postEdit)
  assert.deepEqual(pick(edit, ['type', 'sub', 'worker']), { type: 'edit.after', sub: { id: 'a1a1', type: 'general-purpose' }, worker: true })
  assert.deepEqual(edit.edit.files, [{ path: '/repo/src/a.js', added: [{ line: 3, text: 'export const a = 2' }] }])
  assert.deepEqual(toEvent(PAYLOADS.preAgent).tool.spawn, { use: 'toolu_06', type: 'general-purpose', desc: 'Review the diff', id: undefined, bg: false })
  assert.deepEqual(toEvent(PAYLOADS.postAgentAsync).tool, {
    name: 'Agent(general-purpose): Review the diff', ok: false, spawn: { use: 'toolu_06', type: 'general-purpose', desc: 'Review the diff', id: 'a2a2', bg: true },
  })
  assert.deepEqual(pick(toEvent(PAYLOADS.postMcp), ['type', 'tool']), { type: 'tool.after', tool: { name: 'mcp__emulator__screenshot', ok: true } })
  assert.deepEqual(pick(toEvent(PAYLOADS.stop), ['type', 'turn']), { type: 'turn.end', turn: { reply: 'Done, tests pass.', retry: true, background: 1 } })
  assert.deepEqual(pick(toEvent(PAYLOADS.subagentStart), ['type', 'sub']), { type: 'subagent.start', sub: { id: 'a2a2', type: 'Explore' } })
})

test('decisions become Claude Code JSON: deny, block, context and the user notice', () => {
  assert.deepEqual(reply({ action: 'deny', message: 'no' }, 'PreToolUse'), {
    hookSpecificOutput: { hookEventName: 'PreToolUse', permissionDecision: 'deny', permissionDecisionReason: 'no' },
  })
  assert.deepEqual(reply({ action: 'feedback', message: 'fix it' }, 'PostToolUse'), { decision: 'block', reason: 'fix it' })
  assert.deepEqual(reply({ action: 'continue', message: 'not done' }, 'Stop'), { decision: 'block', reason: 'not done' })
  assert.deepEqual(reply({ action: 'context', context: 'rules', message: 'hi' }, 'SessionStart'), {
    hookSpecificOutput: { hookEventName: 'SessionStart', additionalContext: 'rules' }, systemMessage: 'hi',
  })
  assert.deepEqual(reply({ action: 'context', context: 'rules', message: '' }, 'SubagentStart'), { hookSpecificOutput: { hookEventName: 'SubagentStart', additionalContext: 'rules' } })
  assert.equal(reply(null, 'Stop'), null)
})
