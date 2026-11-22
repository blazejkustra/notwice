import { spawnSync } from 'node:child_process'
import { cpSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { FAKE_BIN, git, parseJsonLines, readJson, readJsonLines, succeeds, write } from '../lib.mjs'
import { SCENARIOS, setupRepo } from '../scenarios.mjs'

export const ARMS = {
  claudemd: { claudeMd: true },
  'hooks-only': { plugin: 'hooksOnlyPlugin', ratchetHome: true },
  ratchet: { plugin: 'ratchetPlugin', ratchetHome: true },
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
    PATH: path.join(':'), RATCHET_HOME: home, FAKE_GH_STATE: join(runDir, 'gh.json'), TMPDIR: join(runDir, 'tmp'),
    GH_CONFIG_DIR: join(runDir, 'gh-config'), GIT_CONFIG_GLOBAL: join(runDir, 'gitconfig'), DISABLE_AUTOUPDATER: '1',
  }
}

function toolSteps(events) {
  const contentOf = (type) => events.filter((e) => e.type === type).flatMap((e) => (Array.isArray(e.message?.content) ? e.message.content : []))
  const failed = new Set(contentOf('user').filter((c) => c.type === 'tool_result' && c.is_error).map((c) => c.tool_use_id))
  return contentOf('assistant').filter((c) => c.type === 'tool_use').map((c) => ({ name: c.name, input: c.input, ok: !failed.has(c.id) }))
}

function usageOf(events, final) {
  const first = events.find((e) => e.type === 'assistant' && e.message?.usage)?.message.usage ?? {}
  const prompt = (u) => (u.input_tokens ?? 0) + (u.cache_creation_input_tokens ?? 0) + (u.cache_read_input_tokens ?? 0)
  return { firstTurnPromptTokens: prompt(first), total: final.usage ?? null }
}

function initSummary(events) {
  const init = events.find((e) => e.type === 'system' && e.subtype === 'init') ?? {}
  return { plugins: (init.plugins ?? []).map((p) => p.name), mcpServers: (init.mcp_servers ?? []).map((s) => s.name), claudeCode: init.claude_code_version ?? null }
}

function ratchetEvents(home) {
  return readJsonLines(join(home, 'log.jsonl')).filter((e) => e.type === 'violation')
}

async function loadRules(config, size) {
  const { parseRule } = await import(join(config.ratchet, 'src', 'rules.mjs'))
  const dir = join(config.homes[size], 'rules')
  return readdirSync(dir).filter((f) => f.endsWith('.md')).map((f) => parseRule(readFileSync(join(dir, f), 'utf8'), join(dir, f)))
}

function pushedCommits(repo) {
  if (!succeeds(repo, 'git', 'rev-parse', '--verify', '-q', 'origin/feature')) return []
  return git(repo, 'log', '--format=%h%x1f%B%x1e', 'origin/main..origin/feature').split('\x1e').map((e) => e.trim()).filter(Boolean)
    .map((entry) => { const [sha, message] = entry.split('\x1f'); return { sha: `pushed ${sha}`, message: message.trim() } })
}

async function finalStateScan(config, size, repo, steps, gh) {
  const check = await import(join(config.ratchet, 'src', 'check.mjs'))
  const gitLib = await import(join(config.ratchet, 'src', 'git.mjs'))
  const rules = await loadRules(config, size)
  const base = gitLib.baseCommit(repo, 'origin/main')
  const lines = gitLib.diffLines(repo, base, gitLib.worktreeTree(repo))
  const commits = [...gitLib.commitsIn(repo, 'HEAD', [base]), ...pushedCommits(repo)]
  const comments = gh.prs.flatMap((pr) => [pr.closeComment, ...(pr.comments ?? [])]).filter(Boolean)
  const commands = steps.filter((s) => s.name === 'Bash' && s.ok).map((s) => s.input?.command ?? '')
  const result = check.merge(
    check.checkLines(rules, lines, 'files'),
    check.checkCommits(rules, commits),
    ...comments.map((text) => check.checkText(rules.filter((r) => r.kind !== 'require'), text, 'comments', 'comment')),
    ...gh.prs.filter((pr) => pr.number >= 100).map((pr) => check.checkText(rules, pr.body ?? '', 'pr', `PR #${pr.number}`)),
    ...commands.map((command) => check.checkCommand(rules, command)),
  )
  return result.violations.map((v) => ({ rule: v.id, where: v.where, excerpt: v.excerpt.slice(0, 120) }))
}

function prepareRun(config, scenario, arm, size, runDir) {
  mkdirSync(join(runDir, 'gh-config'), { recursive: true })
  mkdirSync(join(runDir, 'tmp'), { recursive: true })
  writeFileSync(join(runDir, 'gitconfig'), '[user]\n\tname = Dev\n\temail = dev@example.com\n')
  writeFileSync(join(runDir, 'gh.json'), JSON.stringify(scenario.gh ?? { calls: [], prs: [] }))
  const home = join(runDir, 'home')
  if (arm.ratchetHome) cpSync(config.homes[size], home, { recursive: true })
  else mkdirSync(home, { recursive: true })
  const extra = arm.claudeMd ? { 'CLAUDE.md': readFileSync(config.claudeMd[size], 'utf8') } : {}
  return { repo: setupRepo(runDir, scenario, extra), home }
}

export async function runOnce(config, scenarioName, armName, size, model, runDir) {
  const scenario = SCENARIOS[scenarioName]
  const arm = ARMS[armName]
  const { repo, home } = prepareRun(config, scenario, arm, size, runDir)
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
  const violations = ratchetEvents(home)
  return {
    scenario: scenarioName, arm: armName, size, model, seconds, cost: final.total_cost_usd ?? null, turns: final.num_turns ?? null,
    exit: result.status, resultSubtype: final.subtype ?? 'missing', outcome,
    blocks: violations.filter((e) => e.blocked).map((e) => `${e.where}:${e.rule}`),
    ratchetLogged: violations.map((e) => `${e.where}:${e.rule}${e.blocked ? '' : ' (not blocked)'}`),
    landed: await finalStateScan(config, size, repo, steps, gh), usage: usageOf(events, final),
    final: (final.result ?? '').slice(0, 800), commands: steps.filter((s) => s.name === 'Bash').map((s) => `${s.ok ? '' : '[failed] '}${(s.input?.command ?? '').slice(0, 300)}`).slice(0, 40),
    tools: steps.map((s) => s.name), reads: steps.filter((s) => s.name === 'Read').map((s) => s.input?.file_path ?? ''),
    ghCalls: gh.calls.slice(0, 20), init: initSummary(events),
  }
}

async function main() {
  const [configFile, scenarioName, armName, size, model, runDir] = process.argv.slice(2)
  const config = JSON.parse(readFileSync(configFile, 'utf8'))
  console.log(JSON.stringify(await runOnce(config, scenarioName, armName, Number(size), model, runDir)))
}

if (import.meta.main) await main()
