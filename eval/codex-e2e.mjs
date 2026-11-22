import { execFileSync, spawn } from 'node:child_process'
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { createServer } from 'node:http'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const BIN = join(ROOT, 'bin', 'notwice')
const FAKE_BIN = join(ROOT, 'test', 'fixtures', 'bin')
const EM_DASH = '—'
const ATTRIBUTION = 'Co-Authored-By: Claude <noreply@anthropic.com>'
const work = mkdtempSync(join(process.argv[2] ?? tmpdir(), 'notwice-codex-e2e-'))

const sh = (cwd, cmd, args, env = process.env) => execFileSync(cmd, args, { cwd, env, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] })
const git = (cwd, ...args) => sh(cwd, 'git', ['-c', 'user.name=Dev', '-c', 'user.email=dev@example.com', ...args])

function write(dir, file, text) {
  mkdirSync(dirname(join(dir, file)), { recursive: true })
  writeFileSync(join(dir, file), text)
}

const CODEX_ROW = /^[└├] \S+ {2}codex {2}/m
const agentsList = (home) => sh(work, process.execPath, [BIN, 'agents'], { ...process.env, NOTWICE_HOME: home })

const patch = (...lines) => ['*** Begin Patch', ...lines, '*** End Patch', ''].join('\n')

const SCENARIOS = {
  'attribution commit is denied': {
    steps: [{ shell: `git commit -am "Bump version" -m "${ATTRIBUTION}"` }, { say: 'Committed.' }],
    check: ({ requests, repo, home }) => ({
      listedByAgents: CODEX_ROW.test(agentsList(home)),
      contextInjected: requests[0].input.some((item) => item.role === 'developer' && textOf(item).includes('notwice enforces these rules')),
      skillListed: /notwice:learn/.test(JSON.stringify(requests[0])),
      denied: /Command blocked by PreToolUse hook: notwice blocked this command[\s\S]*no-claude-attribution/.test(toolOutput(requests[1])),
      noCommit: git(repo, 'log', '--format=%s', '-1').trim() === 'Initial commit',
    }),
  },
  'edit feedback after apply_patch': {
    steps: [{ patch: patch('*** Add File: docs/pitch.md', `+tidy ${EM_DASH} a fast formatter`) }, { say: 'Added the pitch.' }],
    check: ({ requests }) => ({ feedback: /this edit adds lines that break a rule[\s\S]*docs\/pitch\.md:1 \[no-em-dash\]/.test(toolOutput(requests[1])) }),
  },
  'apply_patch into active rules is denied': {
    steps: [({ home }) => ({ patch: patch(`*** Add File: ${join(home, 'rules', 'sneaky.md')}`, '+---') }), { say: 'Done.' }],
    check: ({ requests, home }) => ({ denied: /active rules are off-limits/.test(toolOutput(requests[1])), notWritten: !existsSync(join(home, 'rules', 'sneaky.md')) }),
  },
  'failed checks do not count and Stop continues the turn': {
    steps: [
      { patch: patch('*** Update File: src/sum.js', '@@', '-export const sum = (a, b) => a - b', '+export const sum = (a, b) => a + b') },
      { shell: 'touch fail' },
      { shell: 'npm test' },
      { say: 'Done, all tests pass.' },
      { shell: 'rm fail && npm test' },
      { say: 'Done, all tests pass.' },
    ],
    check: ({ requests, events }) => {
      const runs = events.filter((e) => e.run).map((e) => e.run)
      return {
        stopContinued: /You said \\"all tests pass\\", but no check passed after your last edit \(src\/sum\.js\)/.test(JSON.stringify(requests[4]?.input.at(-1) ?? '')),
        onlyPassingRunCounted: runs.length === 1 && /npm test/.test(runs[0]),
        endedAfterPass: requests.length === 6,
      }
    },
  },
}

function textOf(item) {
  return (item.content ?? []).map((c) => c.text ?? '').join('\n')
}

function toolOutput(request) {
  const last = request?.input.findLast((item) => item.type?.endsWith('call_output'))
  return last?.output ?? ''
}

function setupRepo(dir) {
  const repo = join(dir, 'repo')
  const remote = join(dir, 'remote.git')
  mkdirSync(repo, { recursive: true })
  sh(dir, 'git', ['init', '-q', '--bare', '-b', 'main', remote])
  git(repo, 'init', '-q', '-b', 'main')
  write(repo, 'package.json', '{ "name": "kit", "type": "module", "scripts": { "test": "node test.mjs" } }\n')
  write(repo, 'test.mjs', "import { existsSync } from 'node:fs'\nprocess.exit(existsSync('fail') ? 1 : 0)\n")
  write(repo, 'src/sum.js', 'export const sum = (a, b) => a - b\n')
  write(repo, 'README.md', '# kit\n')
  write(repo, '.gitignore', 'fail\n')
  git(repo, 'add', '-A')
  git(repo, 'commit', '-qm', 'Initial commit')
  git(repo, 'remote', 'add', 'origin', remote)
  git(repo, 'push', '-q', '-u', 'origin', 'main')
  git(repo, 'checkout', '-q', '-b', 'feature')
  write(repo, 'README.md', '# kit\n\nVersion 2.\n')
  return repo
}

function setupHome(dir, env) {
  const home = join(dir, 'rules-home')
  sh(dir, process.execPath, [BIN, 'init'], { ...env, NOTWICE_HOME: home })
  const fixtures = join(ROOT, 'test', 'fixtures', 'rules')
  for (const name of readdirSync(fixtures)) copyFileSync(join(fixtures, name), join(home, 'proposed', name))
  const ids = readdirSync(join(home, 'proposed')).map((name) => name.replace(/\.md$/, ''))
  sh(dir, process.execPath, [BIN, 'approve', ...ids], { ...env, NOTWICE_HOME: home })
  return home
}

function fakeModel(steps, context) {
  const requests = []
  const server = createServer((req, res) => {
    let body = ''
    req.on('data', (chunk) => (body += chunk))
    req.on('end', () => {
      if (!req.url.endsWith('/responses')) return res.writeHead(404).end()
      requests.push(JSON.parse(body))
      const n = requests.length
      const given = steps[Math.min(n, steps.length) - 1]
      const step = typeof given === 'function' ? given(context) : given
      res.writeHead(200, { 'content-type': 'text/event-stream' })
      sendEvent(res, 'response.created', { response: { id: `resp_${n}` } })
      sendEvent(res, 'response.output_item.done', { output_index: 0, item: outputItem(step, n) })
      sendEvent(res, 'response.completed', { response: { id: `resp_${n}`, usage: { input_tokens: 1, input_tokens_details: { cached_tokens: 0 }, output_tokens: 1, output_tokens_details: { reasoning_tokens: 0 }, total_tokens: 2 } } })
      res.end()
    })
  })
  return { server, requests }
}

function sendEvent(res, type, data) {
  res.write(`event: ${type}\ndata: ${JSON.stringify({ type, ...data })}\n\n`)
}

function outputItem(step, n) {
  if (step.say != null) return { type: 'message', role: 'assistant', id: `msg_${n}`, content: [{ type: 'output_text', text: step.say }] }
  if (step.patch != null) return { type: 'custom_tool_call', id: `ctc_${n}`, call_id: `call_${n}`, name: 'apply_patch', input: step.patch }
  return { type: 'function_call', id: `fc_${n}`, call_id: `call_${n}`, name: 'exec_command', arguments: JSON.stringify({ cmd: step.shell }) }
}

function codexEnv(dir, port) {
  const codexHome = join(dir, 'codex-home')
  const userHome = join(dir, 'user-home')
  mkdirSync(codexHome, { recursive: true })
  mkdirSync(userHome, { recursive: true })
  write(codexHome, 'config.toml', `model = "gpt-5.5"\nmodel_provider = "fake"\n\n[model_providers.fake]\nname = "fake"\nbase_url = "http://127.0.0.1:${port}/v1"\nwire_api = "responses"\n`)
  write(dir, 'gitconfig', '[user]\n\tname = Dev\n\temail = dev@example.com\n')
  return {
    HOME: userHome, CODEX_HOME: codexHome, PATH: `${FAKE_BIN}:${dirname(process.execPath)}:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin`,
    GIT_CONFIG_GLOBAL: join(dir, 'gitconfig'), FAKE_GH_STATE: join(dir, 'gh.json'), LANG: 'en_US.UTF-8',
  }
}

function runCodex(repo, env, args) {
  return new Promise((resolve) => {
    const child = spawn('codex', ['exec', '--skip-git-repo-check', '--dangerously-bypass-approvals-and-sandbox', ...args, 'Do the task.'], { cwd: repo, env, stdio: ['ignore', 'pipe', 'pipe'] })
    let output = ''
    child.stdout.on('data', (chunk) => (output += chunk))
    child.stderr.on('data', (chunk) => (output += chunk))
    const timer = setTimeout(() => child.kill('SIGKILL'), 120000)
    child.on('exit', (code) => {
      clearTimeout(timer)
      resolve({ code, output })
    })
  })
}

async function runScenario(name, scenario, { trusted = true } = {}) {
  const dir = join(work, name.replace(/\W+/g, '-'))
  mkdirSync(dir, { recursive: true })
  const repo = setupRepo(dir)
  const context = { repo }
  const { server, requests } = fakeModel(scenario.steps, context)
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
  const env = codexEnv(dir, server.address().port)
  context.home = setupHome(dir, env)
  sh(dir, 'codex', ['plugin', 'marketplace', 'add', ROOT], env)
  sh(dir, 'codex', ['plugin', 'add', 'notwice@notwice'], env)
  const started = Date.now()
  const run = await runCodex(repo, { ...env, NOTWICE_HOME: context.home }, trusted ? ['--dangerously-bypass-hook-trust'] : [])
  server.close()
  const sessions = join(context.home, 'sessions')
  const events = (existsSync(sessions) ? readdirSync(sessions).filter((f) => f.endsWith('.events.jsonl')) : [])
    .flatMap((f) => readFileSync(join(sessions, f), 'utf8').split('\n').filter(Boolean).map((line) => JSON.parse(line)))
  const results = scenario.check({ requests, repo, home: context.home, events, run })
  const ok = Object.values(results).every(Boolean)
  return { scenario: name, ok, results, requests: requests.length, exit: run.code, seconds: (Date.now() - started) / 1000, ...(ok ? {} : { output: run.output.slice(-1500) }) }
}

async function main() {
  const version = sh(work, 'codex', ['--version'], { ...process.env, CODEX_HOME: join(work, 'version-home') }).trim()
  console.log(JSON.stringify({ codex: version }))
  const outcomes = []
  for (const [name, scenario] of Object.entries(SCENARIOS)) outcomes.push(await runScenario(name, scenario))
  const untrusted = await runScenario('untrusted plugin hooks stay inert', {
    steps: SCENARIOS['attribution commit is denied'].steps,
    check: ({ repo, home }) => ({ commitRan: git(repo, 'log', '--format=%B', '-1').includes('Co-Authored-By'), notListed: !CODEX_ROW.test(agentsList(home)) }),
  }, { trusted: false })
  outcomes.push(untrusted)
  for (const outcome of outcomes) console.log(JSON.stringify(outcome))
  rmSync(work, { recursive: true, force: true })
  process.exitCode = outcomes.every((o) => o.ok) ? 0 : 1
}

main()
