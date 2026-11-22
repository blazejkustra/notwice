import { execFileSync, spawnSync } from 'node:child_process'
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const [repo, templateHome, runs, ...builds] = process.argv.slice(2)
const git = (...args) => execFileSync('git', ['-c', 'user.name=Dev', '-c', 'user.email=dev@example.com', ...args], { cwd: repo, encoding: 'utf8' })
const homes = builds.map((build, i) => `${templateHome}-paired-${i}`)
const sessions = builds.map((build, i) => `paired-${Date.now()}-${i}`)
const env = { ...process.env, T3CODE_THREAD_ID: '', NOTWICE_SESSION: '', CLAUDE_ENV_FILE: '' }

function cpu(i, args, input) {
  const options = { cwd: repo, input, env: { ...env, NOTWICE_HOME: homes[i] }, encoding: 'utf8' }
  const { stderr } = spawnSync('/usr/bin/time', ['-p', process.execPath, join(builds[i], 'bin', 'notwice'), ...args], options)
  const seconds = (name) => Number(stderr.match(new RegExp(`^${name}\\s+([\\d.]+)`, 'm'))?.[1] ?? NaN)
  return (seconds('user') + seconds('sys')) * 1000
}

const hook = (i, input) => cpu(i, ['hook'], JSON.stringify({ session_id: sessions[i], cwd: repo, ...input }))
const p50 = (list) => [...list].sort((a, b) => a - b)[Math.floor(list.length / 2)]

function sourceLines() {
  const files = git('ls-files', '*.ts').split('\n').filter((f) => f && !f.includes('.d.ts')).slice(0, 40)
  return files.flatMap((f) => readFileSync(join(repo, f), 'utf8').split('\n')).filter((l) => l.trim()).slice(0, 300)
}

const branch = `latency-${Date.now()}`
builds.forEach((build, i) => {
  rmSync(homes[i], { recursive: true, force: true })
  cpSync(templateHome, homes[i], { recursive: true })
})
git('checkout', '-q', '-b', branch)
try {
  builds.forEach((build, i) => hook(i, { hook_event_name: 'SessionStart', source: 'startup' }))
  const lines = sourceLines()
  mkdirSync(join(repo, 'src', 'latency'), { recursive: true })
  for (let i = 0; i < 6; i++) writeFileSync(join(repo, 'src', 'latency', `part${i}.ts`), `${lines.slice(i * 50, i * 50 + 50).join('\n')}\n`)
  git('add', 'src/latency')
  git('commit', '-qm', 'Add latency fixture files')
  const head = git('rev-parse', 'HEAD').trim()
  const base = git('rev-parse', 'HEAD~1').trim()
  const patch = [{ newStart: 1, lines: lines.slice(0, 50).map((l) => `+${l}`) }]
  const file = join(repo, 'src', 'latency', 'part0.ts')
  const message = join(repo, '.git', 'LATENCY_MSG')
  writeFileSync(message, 'Add latency fixture files\n\n# Please enter the commit message\n')
  const cases = {
    'SessionStart': (i) => hook(i, { hook_event_name: 'SessionStart', source: 'resume' }),
    'PostToolUse Write (50 lines)': (i) => hook(i, { hook_event_name: 'PostToolUse', tool_name: 'Write', tool_input: { file_path: file, content: '' }, tool_response: { type: 'create', structuredPatch: patch } }),
    'PreToolUse Bash git push (300 lines)': (i) => hook(i, { hook_event_name: 'PreToolUse', tool_name: 'Bash', tool_input: { command: `git push -u origin ${branch}` } }),
    'Stop (300 lines since start)': (i) => hook(i, { hook_event_name: 'Stop', stop_hook_active: false }),
    'git commit-msg': (i) => cpu(i, ['git-hook', 'commit-msg', message], ''),
    'git pre-push (300 lines, new branch)': (i) => cpu(i, ['git-hook', 'pre-push'], `refs/heads/${branch} ${head} refs/heads/${branch} ${'0'.repeat(40)}\n`),
    'git pre-push (300 lines, known remote tip)': (i) => cpu(i, ['git-hook', 'pre-push'], `refs/heads/${branch} ${head} refs/heads/${branch} ${base}\n`),
  }
  const times = Object.fromEntries(Object.keys(cases).map((name) => [name, builds.map(() => [])]))
  for (let run = 0; run < Number(runs); run++) {
    for (const [name, measure] of Object.entries(cases)) {
      const order = run % 2 ? [...builds.keys()].reverse() : [...builds.keys()]
      for (const i of order) times[name][i].push(measure(i))
    }
  }
  for (const [name, perBuild] of Object.entries(times)) console.log(`| ${name} | ${perBuild.map((list) => p50(list).toFixed(0)).join(' | ')} |`)
} finally {
  git('checkout', '-q', '-')
  git('branch', '-q', '-D', branch)
  rmSync(join(repo, 'src', 'latency'), { recursive: true, force: true })
  homes.forEach((home) => rmSync(home, { recursive: true, force: true }))
}
