import { spawnSync } from 'node:child_process'
import { cpSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { FAKE_BIN, parseJsonLines, readJson, readJsonLines, write } from './lib.mjs'
import { SCENARIOS, setupRepo } from './scenarios.mjs'

export const ARMS = {
  stock: {},
  claudemd: { claudeMd: 'claudeMd' },
  'ratchet-context': { plugin: 'contextPlugin', ratchetHome: true },
  ratchet: { plugin: 'ratchetPlugin', ratchetHome: true },
  superpowers: { plugin: 'superpowersPlugin', claudeMd: 'claudeMd' },
  'agent-skills': { plugin: 'agentSkillsPlugin', claudeMd: 'claudeMd' },
  'claudemd-enforced': { claudeMd: 'claudeMdEnforced' },
  'context-plain': { plugin: 'plainContextPlugin' },
}

const RUN_TIMEOUT_MS = 10 * 60 * 1000

function claudeArgs(config, arm, model, prompt) {
  const args = [
    '-p', '--model', model, '--permission-mode', 'bypassPermissions', '--setting-sources', 'project,local',
    '--no-session-persistence', '--strict-mcp-config', '--mcp-config', '{"mcpServers":{}}',
    '--output-format', 'stream-json', '--verbose', '--max-budget-usd', String(config.maxBudgetPerRun),
  ]
  if (arm.plugin) args.push('--plugin-dir', config[arm.plugin])
  return [...args, prompt]
}

function claudeEnv(runDir, home) {
  const path = [FAKE_BIN, dirname(process.execPath), '/opt/homebrew/bin', '/usr/local/bin', '/usr/bin', '/bin', '/usr/sbin', '/sbin', `${process.env.HOME}/.local/bin`]
  return {
    HOME: process.env.HOME, USER: process.env.USER, LOGNAME: process.env.USER, SHELL: '/bin/zsh', LANG: 'en_US.UTF-8', TERM: 'xterm-256color',
    PATH: path.join(':'), RATCHET_HOME: home, FAKE_GH_STATE: join(runDir, 'gh.json'),
    GH_CONFIG_DIR: join(runDir, 'gh-config'), GIT_CONFIG_GLOBAL: join(runDir, 'gitconfig'), DISABLE_AUTOUPDATER: '1',
  }
}

function toolSteps(events) {
  const contentOf = (type) => events.filter((e) => e.type === type).flatMap((e) => (Array.isArray(e.message?.content) ? e.message.content : []))
  const failed = new Set(contentOf('user').filter((c) => c.type === 'tool_result' && c.is_error).map((c) => c.tool_use_id))
  return contentOf('assistant').filter((c) => c.type === 'tool_use').map((c) => ({ name: c.name, input: c.input, ok: !failed.has(c.id) }))
}

function initSummary(events) {
  const init = events.find((e) => e.type === 'system' && e.subtype === 'init') ?? {}
  return {
    tools: init.tools?.length ?? null, mcpServers: (init.mcp_servers ?? []).map((s) => s.name), skills: init.skills?.length ?? null,
    plugins: (init.plugins ?? []).map((p) => p.name), claudeCode: init.claude_code_version ?? null,
  }
}

function ratchetBlocks(home) {
  return readJsonLines(join(home, 'log.jsonl')).filter((e) => e.blocked).map((e) => `${e.where}:${e.rule}`)
}

function prepareRun(config, scenario, arm, runDir) {
  mkdirSync(join(runDir, 'gh-config'), { recursive: true })
  writeFileSync(join(runDir, 'gitconfig'), '[user]\n\tname = Dev\n\temail = dev@example.com\n')
  writeFileSync(join(runDir, 'gh.json'), JSON.stringify(scenario.gh ?? { calls: [], prs: [] }))
  const home = join(runDir, 'home')
  if (arm.ratchetHome) cpSync(config.homeTemplate, home, { recursive: true })
  else mkdirSync(home, { recursive: true })
  const repo = setupRepo(runDir, scenario, arm.claudeMd ? { 'CLAUDE.md': config[arm.claudeMd] } : {})
  return { repo, home }
}

export function runOnce(config, scenarioName, armName, model, runDir) {
  const scenario = SCENARIOS[scenarioName]
  const arm = ARMS[armName]
  const { repo, home } = prepareRun(config, scenario, arm, runDir)
  const started = Date.now()
  const result = spawnSync('claude', claudeArgs(config, arm, model, scenario.prompt), {
    cwd: repo, env: claudeEnv(runDir, home), encoding: 'utf8', input: '', timeout: RUN_TIMEOUT_MS, maxBuffer: 1 << 28,
  })
  const seconds = Math.round((Date.now() - started) / 1000)
  write(runDir, 'stream.jsonl', result.stdout ?? '')
  const events = parseJsonLines(result.stdout ?? '')
  const final = events.findLast((e) => e.type === 'result') ?? {}
  const steps = toolSteps(events)
  const gh = readJson(join(runDir, 'gh.json'), { calls: [], prs: [] })
  const outcome = scenario.evaluate({ repo, gh, steps, final: final.result ?? '' })
  return {
    scenario: scenarioName, arm: armName, model, seconds, cost: final.total_cost_usd ?? null, turns: final.num_turns ?? null,
    exit: result.status, resultSubtype: final.subtype ?? 'missing', outcome, blocks: ratchetBlocks(home),
    final: (final.result ?? '').slice(0, 800), commands: steps.filter((s) => s.name === 'Bash').map((s) => (s.input?.command ?? '').slice(0, 240)).slice(0, 40),
    tools: steps.map((s) => s.name), ghCalls: gh.calls.slice(0, 20), init: initSummary(events),
  }
}

function main() {
  const [configFile, scenarioName, armName, model, runDir] = process.argv.slice(2)
  const config = JSON.parse(readFileSync(configFile, 'utf8'))
  console.log(JSON.stringify(runOnce(config, scenarioName, armName, model, runDir)))
}

if (import.meta.main) main()
