import { execFileSync, spawn, spawnSync } from 'node:child_process'
import { appendFileSync, copyFileSync, cpSync, existsSync, mkdirSync, readdirSync, readFileSync, realpathSync, rmSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { parseArgs } from 'node:util'
import { createHash } from 'node:crypto'
import { parseJsonLines, readJsonLines } from '../lib.mjs'

const SCALE_DIR = new URL('.', import.meta.url).pathname
const SONNET = 'claude-sonnet-5-5'
const SCENARIOS = ['paste', 'batch-close', 'attribution', 'verify']
const ARMS = ['claudemd', 'hooks-only', 'ratchet']
const CLAUDE_TMP_ROOT = `/private/tmp/claude-${process.getuid()}`
const CLEANUP_ROOTS = [join(homedir(), '.claude', 'projects'), join(homedir(), '.claude', 'plugins', 'data'), CLAUDE_TMP_ROOT]
const HARNESS_FILES = ['run-scale.mjs', '../scenarios.mjs', '../lib.mjs', '../fixtures/bin/gh', 'rule-sets.json']
const HOOKS_ONLY_NOTICE = 'ratchet enforces ${rules.length} rules with hooks. A blocked command or edit names the rule it broke; fix it and retry.'

const { values: opts } = parseArgs({
  options: {
    tmp: { type: 'string' }, ratchet: { type: 'string' }, plan: { type: 'string' }, target: { type: 'string', default: '3' },
    sizes: { type: 'string', default: '12,150,1000' }, concurrency: { type: 'string', default: '4' }, cap: { type: 'string', default: '15' },
    reserve: { type: 'string', default: '0.4' }, seed: { type: 'string', default: '11' },
    results: { type: 'string', default: join(SCALE_DIR, 'results.jsonl') }, probes: { type: 'string', default: join(SCALE_DIR, 'probes.jsonl') },
  },
})

const SETS = JSON.parse(readFileSync(join(SCALE_DIR, 'rule-sets.json'), 'utf8'))
const sizes = opts.sizes.split(',').map(Number)

function harnessVersion() {
  const hash = createHash('sha256')
  for (const file of HARNESS_FILES) hash.update(readFileSync(join(SCALE_DIR, file)))
  return hash.digest('hex').slice(0, 12)
}

const ratchetCli = (home, ...args) => execFileSync(process.execPath, [join(opts.ratchet, 'bin', 'ratchet'), ...args], { env: { ...process.env, RATCHET_HOME: home }, encoding: 'utf8', maxBuffer: 1 << 26 })
const ruleText = (id) => (readFileSync(join(SCALE_DIR, 'rules', `${id}.md`), 'utf8').split(/^---$/m)[2] ?? '').split('\n').map((l) => l.trim()).find(Boolean)

function ratchetHome(size) {
  const home = join(opts.tmp, 'homes', String(size))
  if (existsSync(join(home, 'rules'))) return home
  for (const state of ['proposed', 'rules', 'retired']) mkdirSync(join(home, state), { recursive: true })
  for (const id of SETS.sets[size]) copyFileSync(join(SCALE_DIR, 'rules', `${id}.md`), join(home, 'proposed', `${id}.md`))
  ratchetCli(home, 'approve', ...SETS.sets[size])
  rmSync(join(home, 'log.jsonl'), { force: true })
  return home
}

function claudeMd(size) {
  const file = join(SCALE_DIR, 'claude-md', `${size}.md`)
  mkdirSync(join(SCALE_DIR, 'claude-md'), { recursive: true })
  writeFileSync(file, `Follow these rules:\n${SETS.sets[size].map((id) => `- ${id}: ${ruleText(id)}`).join('\n')}\n`)
  return file
}

function hooksOnlyPlugin() {
  const dir = join(opts.tmp, 'plugins', 'ratchet-hooks-only')
  if (existsSync(dir)) return dir
  cpSync(opts.ratchet, dir, { recursive: true, filter: (src) => !src.includes('/.git') })
  const file = join(dir, 'src', 'hook.mjs')
  const source = readFileSync(file, 'utf8')
  const patched = source.replace(/function ruleContext\(root, rules\) \{[\s\S]*?\n\}\n/, `function ruleContext(root, rules) {\n  return \`${HOOKS_ONLY_NOTICE}\`\n}\n`)
  if (patched === source) throw new Error('could not patch ruleContext')
  writeFileSync(file, patched)
  return dir
}

function prepare() {
  mkdirSync(join(opts.tmp, 'runs'), { recursive: true })
  const config = {
    ratchet: opts.ratchet, ratchetPlugin: opts.ratchet, hooksOnlyPlugin: hooksOnlyPlugin(), maxBudgetPerRun: 1.5,
    homes: Object.fromEntries(sizes.map((size) => [size, ratchetHome(size)])),
    claudeMd: Object.fromEntries(sizes.map((size) => [size, claudeMd(size)])),
  }
  const file = join(opts.tmp, 'config.json')
  writeFileSync(file, JSON.stringify(config, null, 2))
  return { file, config }
}

const cells = () => sizes.flatMap((size) => ARMS.flatMap((arm) => SCENARIOS.map((scenario) => ({ size, arm, scenario }))))
const PLANS = {
  pilot: () => [{ size: 1000, arm: 'claudemd', scenario: 'paste' }, { size: 1000, arm: 'hooks-only', scenario: 'verify' }, { size: 1000, arm: 'ratchet', scenario: 'batch-close' }],
  main: cells,
}

function plannedRuns(version, records) {
  const phase = opts.plan
  const target = phase === 'pilot' ? 1 : Number(opts.target)
  const counted = (c) => records.filter((r) => r.phase === phase && r.version === version && r.size === c.size && r.arm === c.arm && r.scenario === c.scenario && !r.error).length
  return PLANS[phase]().flatMap((c) => Array.from({ length: Math.max(0, target - counted(c)) }, () => ({ ...c, phase })))
}

function shuffle(list, seed) {
  let state = seed >>> 0
  const random = () => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
  const copy = [...list]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

const listCleanupRoots = () => new Set(CLEANUP_ROOTS.flatMap((root) => (existsSync(root) ? readdirSync(root).map((name) => join(root, name)) : [])))

function removeRunFolders(before) {
  const marker = realpathSync(opts.tmp).replace(/[^a-zA-Z0-9]/g, '-')
  for (const path of listCleanupRoots()) {
    if (before.has(path)) continue
    const inlinePluginData = path.includes(join('plugins', 'data')) && /-inline$/.test(path) && readdirSync(path).length === 0
    if (path.includes(marker) || inlinePluginData) rmSync(path, { recursive: true, force: true })
  }
}

const spent = () => [...readJsonLines(opts.results), ...readJsonLines(opts.probes)].reduce((sum, r) => sum + (r.cost ?? 0), 0)

function costFromStream(runDir) {
  const file = join(runDir, 'stream.jsonl')
  if (!existsSync(file)) return null
  return parseJsonLines(readFileSync(file, 'utf8')).findLast((e) => e.type === 'result')?.total_cost_usd ?? null
}

function execute(configFile, run, index, version) {
  const id = `${run.phase}-${run.size}-${run.arm}-${run.scenario}-${Date.now().toString(36)}${index}`
  const runDir = join(opts.tmp, 'runs', id)
  mkdirSync(runDir, { recursive: true })
  const startedAt = new Date().toISOString()
  const env = { ...process.env, RATCHET_HOME: join(opts.tmp, 'scan-home') }
  return new Promise((resolve) => {
    const child = spawn(process.execPath, [join(SCALE_DIR, 'run-scale.mjs'), configFile, run.scenario, run.arm, String(run.size), SONNET, runDir], { stdio: ['ignore', 'pipe', 'pipe'], env })
    let stdout = ''
    let stderr = ''
    child.stdout.on('data', (chunk) => (stdout += chunk))
    child.stderr.on('data', (chunk) => (stderr += chunk))
    child.on('close', (code) => {
      const parsed = parseJsonLines(stdout).at(-1)
      const meta = { id, phase: run.phase, version, claudeMdVisible: !realpathSync(opts.tmp).startsWith(CLAUDE_TMP_ROOT), startedAt }
      resolve(parsed && code === 0 ? { ...meta, ...parsed } : { ...meta, ...run, error: stderr.slice(-2000), cost: costFromStream(runDir) })
    })
  })
}

function probePrompt(ids) {
  return [
    'Do not use any tools. Answer only from the instructions already in your context.',
    `Quote the text of each of these rules exactly, one per line: (1) ${ids[0]} (2) ${ids[1]} (3) ${ids[2]}.`,
    'Write UNKNOWN for any rule that is not in your context. On a last line, write how many rules you were given in total.',
  ].join('\n')
}

function probe(config, arm, size) {
  const dir = join(opts.tmp, 'probes', `${arm}-${size}`)
  const repo = join(dir, 'repo')
  mkdirSync(repo, { recursive: true })
  execFileSync('git', ['init', '-q', '-b', 'main', repo])
  writeFileSync(join(repo, 'README.md'), '# probe\n')
  if (arm === 'claudemd') copyFileSync(config.claudeMd[size], join(repo, 'CLAUDE.md'))
  execFileSync('git', ['-C', repo, '-c', 'user.name=Dev', '-c', 'user.email=dev@example.com', 'add', '-A'])
  execFileSync('git', ['-C', repo, '-c', 'user.name=Dev', '-c', 'user.email=dev@example.com', 'commit', '-qm', 'init'])
  const home = join(dir, 'home')
  if (arm === 'hooks-only' || arm === 'ratchet') cpSync(config.homes[size], home, { recursive: true })
  else mkdirSync(home, { recursive: true })
  const ids = SETS.sets[size]
  const asked = [ids[0], ids[Math.floor(ids.length / 2)], ids.at(-1)]
  const args = ['-p', '--model', SONNET, '--tools', '', '--setting-sources', 'project,local', '--no-session-persistence', '--strict-mcp-config', '--mcp-config', '{"mcpServers":{}}', '--output-format', 'json']
  if (arm === 'hooks-only') args.push('--plugin-dir', config.hooksOnlyPlugin)
  if (arm === 'ratchet') args.push('--plugin-dir', config.ratchetPlugin)
  const result = spawnSync('claude', [...args, probePrompt(asked)], { cwd: repo, encoding: 'utf8', input: '', env: { ...process.env, RATCHET_HOME: home }, timeout: 300000 })
  const out = JSON.parse(result.stdout || '{}')
  const answer = out.result ?? ''
  const norm = (t) => t.toLowerCase().replace(/\s+/g, ' ')
  const found = asked.map((id) => norm(answer).includes(norm(ruleText(id)).slice(0, 40)))
  const u = out.usage ?? {}
  return {
    kind: 'probe', arm, size, asked, found, answer: answer.slice(0, 1500), cost: out.total_cost_usd ?? null,
    promptTokens: (u.input_tokens ?? 0) + (u.cache_creation_input_tokens ?? 0) + (u.cache_read_input_tokens ?? 0), usage: u,
    claudeMdChars: arm === 'claudemd' ? readFileSync(config.claudeMd[size], 'utf8').length : null,
  }
}

async function runProbes(config) {
  const plan = [['stock', 12], ...sizes.map((s) => ['claudemd', s]), ...sizes.map((s) => ['ratchet', s]), ['hooks-only', Math.max(...sizes)]]
  for (const [arm, size] of plan) {
    const record = probe(config, arm, size)
    appendFileSync(opts.probes, `${JSON.stringify(record)}\n`)
    console.log(`probe ${arm} ${size}: found ${record.found.join(',')} prompt ${record.promptTokens} tokens $${(record.cost ?? 0).toFixed(3)}`)
  }
}

async function main() {
  const version = harnessVersion()
  const { file, config } = prepare()
  const before = listCleanupRoots()
  if (opts.plan === 'prepare') return
  if (opts.plan === 'probe') {
    await runProbes(config)
    removeRunFolders(before)
    return
  }
  const records = readJsonLines(opts.results)
  const queue = shuffle(plannedRuns(version, records), Number(opts.seed))
  const cap = Number(opts.cap)
  let worst = Number(opts.reserve)
  let inFlight = 0
  let index = 0
  console.log(`version ${version}, ${queue.length} runs planned, spent so far $${spent().toFixed(2)}`)
  const worker = async () => {
    while (queue.length) {
      if (spent() + (inFlight + 1) * worst > cap) {
        console.log(`budget stop: spent $${spent().toFixed(2)}, ${queue.length} runs left`)
        queue.length = 0
        return
      }
      const run = queue.shift()
      inFlight++
      const record = await execute(file, run, index++, version)
      inFlight--
      appendFileSync(opts.results, `${JSON.stringify(record)}\n`)
      worst = Math.max(worst, record.cost ?? 0)
      const verdict = record.error ? `ERROR ${record.error.split('\n').slice(-3).join(' ')}` : `violation=${record.outcome.violation} done=${record.outcome.done}`
      console.log(`${record.size} ${record.arm} ${record.scenario} ${verdict} $${(record.cost ?? 0).toFixed(3)} ${record.turns ?? '?'}t ${record.seconds ?? '?'}s blocks=${record.blocks?.join(',') || 0} landed=${record.landed?.map((l) => l.rule).join(',') || 0} | total $${spent().toFixed(2)}`)
    }
  }
  await Promise.all(Array.from({ length: Number(opts.concurrency) }, worker))
  removeRunFolders(before)
}

await main()
