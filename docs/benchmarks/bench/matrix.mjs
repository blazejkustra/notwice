import { execFileSync, spawn } from 'node:child_process'
import { appendFileSync, cpSync, existsSync, mkdirSync, readdirSync, readFileSync, realpathSync, rmSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { parseArgs } from 'node:util'
import { BENCH_DIR, harnessVersion, parseJsonLines, readJsonLines } from './lib.mjs'
import { SCENARIOS } from './scenarios.mjs'

const SONNET = 'claude-sonnet-5-5'
const OPUS = 'claude-opus-5-5'
const USER_RULES = ['no-claude-attribution', 'tests-after-code', 'pr-sections', 'pr-no-extra-sections', 'no-em-dash', 'pr-close-needs-reason']
const FIXTURE_RULES = ['pr-sections', 'pr-no-extra-sections', 'no-em-dash', 'pr-close-needs-reason']
const UNUSED_STARTERS = ['max-pr-size', 'no-private-key', 'no-print-p8']
const MAIN_ARMS = ['stock', 'claudemd', 'ratchet-context', 'ratchet', 'superpowers', 'agent-skills']
const ABLATION_ARMS = ['claudemd-enforced', 'context-plain']
const PLAIN_HEADER = 'Follow these rules:'
const ENFORCED_HEADER = 'ratchet enforces these rules with hooks. A blocking violation stops until you fix it:'
const CLAUDE_TMP_ROOT = `/private/tmp/claude-${process.getuid()}`
const CLEANUP_ROOTS = [join(homedir(), '.claude', 'projects'), CLAUDE_TMP_ROOT]

const { values: opts } = parseArgs({
  options: {
    tmp: { type: 'string' }, ratchet: { type: 'string' }, superpowers: { type: 'string' }, 'agent-skills': { type: 'string' },
    plan: { type: 'string' }, target: { type: 'string', default: '5' }, concurrency: { type: 'string', default: '4' },
    cap: { type: 'string', default: '15' }, reserve: { type: 'string', default: '0.3' }, results: { type: 'string', default: join(BENCH_DIR, 'results.jsonl') }, seed: { type: 'string', default: '7' },
  },
})

const ratchetCli = (home, ...args) => execFileSync(process.execPath, [join(opts.ratchet, 'bin', 'ratchet'), ...args], { env: { ...process.env, RATCHET_HOME: home }, encoding: 'utf8' })

function contextOnlyPlugin() {
  const dir = join(opts.tmp, 'plugins', 'ratchet-context')
  if (existsSync(dir)) return dir
  cpSync(opts.ratchet, dir, { recursive: true, filter: (src) => !src.includes('/.git') })
  const hooks = JSON.parse(readFileSync(join(opts.ratchet, 'hooks', 'hooks.json'), 'utf8'))
  writeFileSync(join(dir, 'hooks', 'hooks.json'), JSON.stringify({ hooks: { SessionStart: hooks.hooks.SessionStart } }, null, 2))
  return dir
}

function homeTemplate() {
  const home = join(opts.tmp, 'home-template')
  if (existsSync(home)) return home
  ratchetCli(home, 'init')
  for (const id of FIXTURE_RULES) cpSync(join(opts.ratchet, 'test', 'fixtures', 'rules', `${id}.md`), join(home, 'proposed', `${id}.md`))
  ratchetCli(home, 'approve', ...USER_RULES)
  ratchetCli(home, 'retire', ...UNUSED_STARTERS)
  return home
}

function ruleText(file) {
  const body = readFileSync(file, 'utf8').split(/^---$/m)[2] ?? ''
  return body.split('\n').map((l) => l.trim()).find(Boolean)
}

function ruleList(home, header) {
  const lines = [...USER_RULES].sort().map((id) => `- ${id}: ${ruleText(join(home, 'rules', `${id}.md`))}`)
  return `${header}\n${lines.join('\n')}\n`
}

function plainContextPlugin(text) {
  const dir = join(opts.tmp, 'plugins', 'rules-context')
  const hook = { type: 'command', command: 'cat "${CLAUDE_PLUGIN_ROOT}/context.json"', timeout: 10 }
  mkdirSync(join(dir, '.claude-plugin'), { recursive: true })
  mkdirSync(join(dir, 'hooks'), { recursive: true })
  writeFileSync(join(dir, '.claude-plugin', 'plugin.json'), JSON.stringify({ name: 'rules-context', version: '0.0.0', description: 'Benchmark arm: the rule list at SessionStart' }))
  writeFileSync(join(dir, 'hooks', 'hooks.json'), JSON.stringify({ hooks: { SessionStart: [{ hooks: [hook] }] } }))
  writeFileSync(join(dir, 'context.json'), JSON.stringify({ hookSpecificOutput: { hookEventName: 'SessionStart', additionalContext: text } }))
  return dir
}

function prepare() {
  mkdirSync(join(opts.tmp, 'runs'), { recursive: true })
  const home = homeTemplate()
  const claudeMd = ruleList(home, PLAIN_HEADER)
  const config = {
    ratchetPlugin: opts.ratchet, contextPlugin: contextOnlyPlugin(), superpowersPlugin: opts.superpowers, agentSkillsPlugin: opts['agent-skills'],
    plainContextPlugin: plainContextPlugin(claudeMd), homeTemplate: home, claudeMd, claudeMdEnforced: ruleList(home, ENFORCED_HEADER), maxBudgetPerRun: 1,
  }
  writeFileSync(join(opts.tmp, 'config.json'), JSON.stringify(config, null, 2))
  writeFileSync(join(BENCH_DIR, 'claude-md-rules.md'), config.claudeMd)
  return join(opts.tmp, 'config.json')
}

const cells = (scenarios, arms, model) => scenarios.flatMap((scenario) => arms.map((arm) => ({ scenario, arm, model })))
const SCENARIO_NAMES = Object.keys(SCENARIOS)

const PLANS = {
  pilot: () => [...SCENARIO_NAMES.map((scenario, i) => ({ scenario, arm: MAIN_ARMS[i], model: SONNET })), { scenario: 'attribution', arm: 'ratchet', model: OPUS }],
  sonnet: () => cells(SCENARIO_NAMES, MAIN_ARMS, SONNET),
  opus: () => cells(['attribution', 'verify'], ['stock', 'claudemd', 'ratchet'], OPUS),
  ablation: () => cells(['attribution', 'paste', 'batch-close'], ABLATION_ARMS, SONNET),
  'claudemd-visible': () => cells(['attribution', 'paste', 'batch-close', 'pr-body', 'verify'], ['claudemd'], SONNET),
}

function plannedRuns(version, records) {
  const phase = opts.plan === 'pilot' ? 'pilot' : 'main'
  const target = phase === 'pilot' ? 1 : Number(opts.target)
  const sameCell = (r, c) => r.scenario === c.scenario && r.arm === c.arm && r.model === c.model && Boolean(r.claudeMdVisible) === opts.claudeMdVisible
  const counted = (c) => records.filter((r) => r.phase === phase && r.version === version && sameCell(r, c) && !r.error).length
  return PLANS[opts.plan]().flatMap((c) => Array.from({ length: Math.max(0, target - counted(c)) }, () => ({ ...c, phase })))
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

function listCleanupRoots() {
  return new Set(CLEANUP_ROOTS.flatMap((root) => (existsSync(root) ? readdirSync(root).map((name) => join(root, name)) : [])))
}

function removeRunFolders(before) {
  const marker = realpathSync(join(opts.tmp, 'runs')).replace(/[^a-zA-Z0-9]/g, '-')
  for (const path of listCleanupRoots()) {
    if (!before.has(path) && path.includes(marker)) rmSync(path, { recursive: true, force: true })
  }
}

function costFromStream(runDir) {
  const file = join(runDir, 'stream.jsonl')
  if (!existsSync(file)) return null
  return parseJsonLines(readFileSync(file, 'utf8')).findLast((e) => e.type === 'result')?.total_cost_usd ?? null
}

function execute(configFile, run, index) {
  const id = `${run.phase}-${run.scenario}-${run.arm}-${run.model.split('-')[1]}-${Date.now().toString(36)}${index}`
  const runDir = join(opts.tmp, 'runs', id)
  mkdirSync(runDir, { recursive: true })
  const startedAt = new Date().toISOString()
  return new Promise((resolve) => {
    const child = spawn(process.execPath, [join(BENCH_DIR, 'run.mjs'), configFile, run.scenario, run.arm, run.model, runDir], { stdio: ['ignore', 'pipe', 'pipe'] })
    let stdout = ''
    let stderr = ''
    child.stdout.on('data', (chunk) => (stdout += chunk))
    child.stderr.on('data', (chunk) => (stderr += chunk))
    child.on('close', (code) => {
      const parsed = parseJsonLines(stdout).at(-1)
      const meta = { id, phase: run.phase, version: opts.version, claudeMdVisible: opts.claudeMdVisible, startedAt }
      const record = parsed && code === 0 ? { ...meta, ...parsed } : { ...meta, ...run, error: stderr.slice(-2000), cost: costFromStream(runDir) }
      resolve(record)
    })
  })
}

function spent(records) {
  return records.reduce((sum, r) => sum + (r.cost ?? 0), 0)
}

async function main() {
  opts.version = harnessVersion()
  const configFile = prepare()
  opts.claudeMdVisible = !realpathSync(opts.tmp).startsWith(CLAUDE_TMP_ROOT)
  const records = readJsonLines(opts.results)
  const queue = shuffle(plannedRuns(opts.version, records), Number(opts.seed))
  const cap = Number(opts.cap)
  const before = listCleanupRoots()
  let worst = Number(opts.reserve)
  let inFlight = 0
  let index = 0
  console.log(`version ${opts.version}, ${queue.length} runs planned, spent so far $${spent(records).toFixed(2)}`)
  const worker = async () => {
    while (queue.length) {
      if (spent(records) + (inFlight + 1) * worst > cap) {
        console.log(`budget stop: spent $${spent(records).toFixed(2)}, ${queue.length} runs left`)
        queue.length = 0
        return
      }
      const run = queue.shift()
      inFlight++
      const record = await execute(configFile, run, index++)
      inFlight--
      records.push(record)
      appendFileSync(opts.results, `${JSON.stringify(record)}\n`)
      worst = Math.max(worst, record.cost ?? 0)
      const verdict = record.error ? `ERROR ${record.error.split('\n').slice(-3).join(' ')}` : `violation=${record.outcome.violation} done=${record.outcome.done}`
      console.log(`${record.scenario} ${record.arm} ${record.model} ${verdict} $${(record.cost ?? 0).toFixed(3)} ${record.turns ?? '?'}t ${record.seconds ?? '?'}s blocks=${record.blocks?.length ?? 0} | total $${spent(records).toFixed(2)}`)
    }
  }
  await Promise.all(Array.from({ length: Number(opts.concurrency) }, worker))
  removeRunFolders(before)
}

await main()
