// Hook latency with a realistic session diff: 6 new files of 50 lines each, committed after SessionStart.
// usage: node latency-loaded.mjs <ratchet clone> <git repo without origin> <ratchet home> [runs]
// LATENCY_CPU=1 reports user+sys CPU time of each hook process tree instead of wall time.
import { execFileSync, spawnSync } from 'node:child_process'
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const [ratchet, repo, templateHome, runs = '20'] = process.argv.slice(2)
const bin = join(ratchet, 'bin', 'ratchet')
const home = `${templateHome}-latency`
const session = `loaded-${Date.now()}`
const git = (...args) => execFileSync('git', ['-c', 'user.name=Dev', '-c', 'user.email=dev@example.com', ...args], { cwd: repo, encoding: 'utf8' })

const useCpu = process.env.LATENCY_CPU === '1'

function hook(input) {
  const options = { input: JSON.stringify({ session_id: session, cwd: repo, ...input }), env: { ...process.env, RATCHET_HOME: home }, encoding: 'utf8' }
  if (useCpu) {
    const { stderr } = spawnSync('/usr/bin/time', ['-p', process.execPath, bin, 'hook'], options)
    const seconds = (name) => Number(stderr.match(new RegExp(`^${name}\\s+([\\d.]+)`, 'm'))?.[1] ?? NaN)
    return (seconds('user') + seconds('sys')) * 1000
  }
  const start = process.hrtime.bigint()
  spawnSync(process.execPath, [bin, 'hook'], options)
  return Number(process.hrtime.bigint() - start) / 1e6
}

function sourceLines() {
  const files = git('ls-files', '*.ts').split('\n').filter((f) => f && !f.includes('.d.ts')).slice(0, 40)
  return files.flatMap((f) => readFileSync(join(repo, f), 'utf8').split('\n')).filter((l) => l.trim()).slice(0, 300)
}

const percentile = (sorted, p) => sorted[Math.min(sorted.length - 1, Math.floor((p / 100) * sorted.length))]

function measure(name, input) {
  const times = Array.from({ length: Number(runs) }, () => hook(input)).sort((a, b) => a - b)
  console.log(`${name.padEnd(34)} p50 ${percentile(times, 50).toFixed(0).padStart(4)} ms   p95 ${percentile(times, 95).toFixed(0).padStart(4)} ms`)
}

function main() {
  rmSync(home, { recursive: true, force: true })
  cpSync(templateHome, home, { recursive: true })
  const branch = `latency-${Date.now()}`
  git('checkout', '-q', '-b', branch)
  try {
    hook({ hook_event_name: 'SessionStart', source: 'startup' })
    const lines = sourceLines()
    mkdirSync(join(repo, 'src', 'latency'), { recursive: true })
    for (let i = 0; i < 6; i++) writeFileSync(join(repo, 'src', 'latency', `part${i}.ts`), `${lines.slice(i * 50, i * 50 + 50).join('\n')}\n`)
    git('add', 'src/latency')
    git('commit', '-qm', 'Add latency fixture files')
    const patch = [{ newStart: 1, lines: lines.slice(0, 50).map((l) => `+${l}`) }]
    const file = join(repo, 'src', 'latency', 'part0.ts')
    console.log(`${lines.length} added lines in 6 files, 1 commit`)
    measure('PostToolUse Write (50-line patch)', { hook_event_name: 'PostToolUse', tool_name: 'Write', tool_input: { file_path: file, content: '' }, tool_response: { type: 'create', structuredPatch: patch } })
    measure('PreToolUse Bash (git push, 300 lines)', { hook_event_name: 'PreToolUse', tool_name: 'Bash', tool_input: { command: `git push -u origin ${branch}` } })
    measure('Stop (300 lines since start)', { hook_event_name: 'Stop', stop_hook_active: false })
  } finally {
    git('checkout', '-q', 'main')
    git('branch', '-q', '-D', branch)
    rmSync(join(repo, 'src', 'latency'), { recursive: true, force: true })
    rmSync(home, { recursive: true, force: true })
  }
}

main()
