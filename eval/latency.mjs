import { spawnSync } from 'node:child_process'
import { rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const [repo, runs = '40'] = process.argv.slice(2)
const bin = fileURLToPath(new URL('../bin/notwice', import.meta.url))
const fakeBin = fileURLToPath(new URL('../test/fixtures/bin', import.meta.url))
const file = join(repo, 'notwice-latency.md')
const transcript = join(repo, '.git', 'notwice-latency-transcript.jsonl')
const message = join(repo, '.git', 'NOTWICE_LATENCY_MSG')
writeFileSync(file, 'A plain line.\nAnother plain line.\n')
writeFileSync(message, 'Fix the slug helper\n')
const filler = JSON.stringify({ type: 'event_msg', payload: { type: 'item_completed', item: { type: 'CommandExecution', id: 'call_0', aggregated_output: 'x'.repeat(400), exit_code: 0 } } })
writeFileSync(transcript, `${`${filler}\n`.repeat(5000)}${JSON.stringify({ type: 'event_msg', payload: { type: 'item_completed', item: { type: 'CommandExecution', id: 'call_9', exit_code: 0 } } })}\n`)
const codex = (input) => ({ args: ['hook', '--agent', 'codex'], input: { transcript_path: transcript, ...input } })

const cases = {
  'SessionStart': { hook_event_name: 'SessionStart', source: 'startup' },
  'PostToolUse Write': { hook_event_name: 'PostToolUse', tool_name: 'Write', tool_input: { file_path: file, content: 'A plain line.\n' }, tool_response: { type: 'create', structuredPatch: [] } },
  'PreToolUse Write': { hook_event_name: 'PreToolUse', tool_name: 'Write', tool_input: { file_path: file, content: '' } },
  'PreToolUse Bash (ls)': { hook_event_name: 'PreToolUse', tool_name: 'Bash', tool_input: { command: 'ls -la' } },
  'PreToolUse Bash (git push)': { hook_event_name: 'PreToolUse', tool_name: 'Bash', tool_input: { command: 'git push' } },
  'PostToolUse Bash (git commit)': { hook_event_name: 'PostToolUse', tool_name: 'Bash', tool_input: { command: 'git commit -m x' } },
  'PostToolUse Bash (npm test)': { hook_event_name: 'PostToolUse', tool_name: 'Bash', tool_input: { command: 'npm test' }, tool_response: { interrupted: false } },
  'PostToolUse MCP': { hook_event_name: 'PostToolUse', tool_name: 'mcp__emulator__screenshot', tool_input: {}, tool_response: [] },
  'Stop': { hook_event_name: 'Stop', stop_hook_active: false },
  'UserPromptSubmit': { hook_event_name: 'UserPromptSubmit', prompt: 'Fix the slug bug' },
  'PreToolUse Agent': { hook_event_name: 'PreToolUse', tool_name: 'Agent', tool_use_id: 'u1', tool_input: { description: 'Review the diff', prompt: 'x' } },
  'PostToolUse Agent': { hook_event_name: 'PostToolUse', tool_name: 'Agent', tool_use_id: 'u1', tool_input: { description: 'Review the diff', prompt: 'x' }, tool_response: { status: 'completed', agentId: 'a1' } },
  'SubagentStart': { hook_event_name: 'SubagentStart', agent_id: 'a1', agent_type: 'general-purpose' },
  'SubagentStop': { hook_event_name: 'SubagentStop', agent_id: 'a1', agent_type: 'general-purpose', stop_hook_active: false },
  'PreToolUse Bash (gh pr create)': { hook_event_name: 'PreToolUse', tool_name: 'Bash', tool_input: { command: 'gh pr create --title T --body B' } },
  'Codex PreToolUse Bash (ls)': codex({ hook_event_name: 'PreToolUse', tool_name: 'Bash', tool_input: { command: 'ls -la' } }),
  'Codex PostToolUse Bash (npm test)': codex({ hook_event_name: 'PostToolUse', tool_name: 'Bash', tool_input: { command: 'npm test' }, tool_response: 'ok', tool_use_id: 'call_9' }),
  'Codex PostToolUse apply_patch': codex({ hook_event_name: 'PostToolUse', tool_name: 'apply_patch', tool_input: { command: '*** Begin Patch\n*** Add File: notwice-latency.md\n+A plain line.\n*** End Patch\n' }, tool_response: 'Exit code: 0' }),
  'Codex Stop': codex({ hook_event_name: 'Stop', stop_hook_active: false, last_assistant_message: 'Done.' }),
  'git commit-msg': { args: ['git-hook', 'commit-msg', message] },
  'git pre-commit': { args: ['git-hook', 'pre-commit'] },
}

const percentile = (sorted, p) => sorted[Math.min(sorted.length - 1, Math.floor((p / 100) * sorted.length))]
const measureCpu = process.env.LATENCY_CPU === '1'
const only = process.env.LATENCY_CASES?.split(',')

function timed(args, options) {
  if (!measureCpu) {
    const start = process.hrtime.bigint()
    spawnSync(process.execPath, [bin, ...args], options)
    return Number(process.hrtime.bigint() - start) / 1e6
  }
  const { stderr } = spawnSync('/usr/bin/time', ['-p', process.execPath, bin, ...args], { ...options, encoding: 'utf8' })
  const seconds = (name) => Number(stderr.match(new RegExp(`^${name}\\s+([\\d.]+)`, 'm'))?.[1] ?? NaN)
  return (seconds('user') + seconds('sys')) * 1000
}

for (const [name, given] of Object.entries(cases).filter(([name]) => !only || only.includes(name))) {
  const { args, input } = given.args ? given : { args: ['hook'], input: given }
  const times = []
  for (let i = 0; i < Number(runs); i++) {
    times.push(timed(args, {
      cwd: repo,
      input: input && JSON.stringify({ session_id: name === 'SessionStart' ? `latency-${i}` : 'latency', cwd: repo, ...input }),
      env: { ...process.env, PATH: `${fakeBin}:${process.env.PATH}`, FAKE_GH_STATE: join(repo, '.git', 'fake-gh.json') },
    }))
  }
  times.sort((a, b) => a - b)
  console.log(`${name.padEnd(36)} p50 ${percentile(times, 50).toFixed(0).padStart(4)} ms   p95 ${percentile(times, 95).toFixed(0).padStart(4)} ms`)
}

for (const path of [file, transcript, message]) rmSync(path, { force: true })
