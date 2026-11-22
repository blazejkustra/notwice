import { copyFileSync, existsSync, lstatSync, mkdirSync, readdirSync, readFileSync, renameSync } from 'node:fs'
import { basename, dirname, join } from 'node:path'
import { ciChange, ciResult, formatResult, scanRange } from './adapters/ci.mjs'
import * as claude from './adapters/claude.mjs'
import * as codex from './adapters/codex.mjs'
import { runGitHook, setGitHooks } from './adapters/git-hook.mjs'
import { formatAgents } from './core/agents.mjs'
import { blocking, checkSize, merge, prove } from './core/check.mjs'
import { baseCommit, git, numstat, repoName, repoRoot, worktreeTree } from './core/git.mjs'
import {
  BUILTIN_DIR, DAY_MS, STARTER_DIR, STATES, groupBy, home, loadDir, loadFile, loadRules, locations, log, logError, readJsonl, readText, recordFailure,
  recordRulesHash,
} from './core/store.mjs'
import { formatInventory, inventory } from './memory.mjs'

const USAGE = `notwice turns corrections into rules that hooks and CI enforce.

  notwice init                         add the starter rules to proposed/
  notwice list                         show active, proposed and retired rules
  notwice test [id...]                 prove rules: Bad must trigger, Good must pass
  notwice propose <id> "<incident>"    prove a drafted proposal and record the failure
  notwice approve <id...>              activate proposals (only the user runs this)
  notwice retire <id...>               retire active rules or proposals (only the user runs this)
  notwice check [--base <ref>]         check the branch diff and commits
  notwice check --ci [--base <ref>] [--pr-title <t>] [--pr-body-file <f>] [--format text|github|json]
                                       check a PR in any CI (GitHub and GitLab are read automatically)
  notwice install-git-hooks [--global] add pre-commit, commit-msg and pre-push hooks through git config
  notwice uninstall-git-hooks [--global]
  notwice stats                        fires per rule and prune candidates
  notwice memory [--json]              list what agents are told to remember or obey, read-only
  notwice agents [--days N] [--all]    sessions and their subagents, last 24 h by default
  notwice hook [--agent claude|codex]  run an agent hook (JSON on stdin)`

const COMMANDS = {
  init, list, test, propose, approve, retire, check, stats, memory, agents, hook,
  'git-hook': gitHook, 'install-git-hooks': (args) => setHooks(args, true), 'uninstall-git-hooks': (args) => setHooks(args, false),
}

const isHelp = (arg) => arg === '--help' || arg === '-h'

export function main(argv) {
  const [name, ...args] = argv
  const command = COMMANDS[name]
  if (command && !args.some(isHelp)) return command(args)
  console.log(USAGE)
  return name && !command && !isHelp(name) ? 1 : 0
}

const cwdRoot = () => repoRoot(process.cwd())
const flag = (args, name) => (args.includes(name) ? args[args.indexOf(name) + 1] : undefined)
const fail = (message) => {
  console.error(`notwice: ${message}`)
  return 1
}

const idOf = (entry) => basename(entry.file, '.md')
const proofOf = (entry) => (entry.error ? [entry.error.message] : prove(entry.rule))
const notProven = (id, problems) => `${id} is not proven yet:\n${problems.map((p) => `- ${p}`).join('\n')}`
const eachId = (ids, action) => (ids.length ? Math.max(...ids.map(action)) : fail('name at least one rule id'))

function findRule(id, state) {
  const candidates = locations(cwdRoot()).map((location) => ({ file: join(location.dir, state, `${id}.md`), location }))
  return candidates.find(({ file }) => existsSync(file)) ?? null
}

function moveTo(found, state) {
  const target = join(found.location.dir, state, basename(found.file))
  if (existsSync(target)) return null
  mkdirSync(dirname(target), { recursive: true })
  renameSync(found.file, target)
  return target
}

function init() {
  for (const state of STATES) mkdirSync(join(home(), state), { recursive: true })
  const existing = new Set(STATES.flatMap((state) => readdirSync(join(home(), state))))
  const added = readdirSync(STARTER_DIR).filter((name) => name.endsWith('.md') && !existing.has(name))
  for (const name of added) copyFileSync(join(STARTER_DIR, name), join(home(), 'proposed', name))
  console.log(`Rules home: ${home()}`)
  console.log(`Added ${added.length} starter proposal(s). Review them with "notwice list" and "notwice test".`)
  if (added.length) console.log(`Approve the ones you want: notwice approve ${added.map((name) => basename(name, '.md')).join(' ')}`)
  return 0
}

function list() {
  console.log(`Rules home: ${home()}`)
  const stateDirs = locations(cwdRoot()).flatMap((location) =>
    STATES.map((state) => [`${location.name} ${state === 'rules' ? 'active' : state}`, join(location.dir, state)]),
  )
  for (const [label, dir] of [...stateDirs, ['built-in active', BUILTIN_DIR]]) {
    const entries = loadDir(dir)
    if (!entries.length) continue
    console.log(`\n${label} (${dir}):`)
    for (const entry of entries) console.log(`  ${listLine(entry)}`)
  }
  return 0
}

function listLine({ rule, file, error }) {
  if (error) return `${basename(file)}  cannot parse: ${error.message}`
  return `${rule.id.padEnd(28)} ${rule.kind.padEnd(15)} ${rule.severity.padEnd(5)}  ${rule.text}`
}

const labeled = (dir, label) => loadDir(dir).map((entry) => ({ ...entry, label }))

function provableEntries() {
  const located = locations(cwdRoot()).flatMap((location) =>
    ['proposed', 'rules'].flatMap((state) => labeled(join(location.dir, state), `${location.name} ${state}`)),
  )
  return [...located, ...labeled(BUILTIN_DIR, 'built-in')]
}

function test(ids) {
  const entries = provableEntries().filter((entry) => !ids.length || ids.includes(idOf(entry)))
  if (!entries.length) return fail(ids.length ? `no rule named ${ids.join(', ')}` : 'no rules found')
  let failed = 0
  for (const entry of entries) {
    const problems = proofOf(entry)
    if (problems.length) failed++
    console.log(`${problems.length ? 'FAIL' : 'ok  '} ${idOf(entry)} (${entry.label})`)
    for (const problem of problems) console.log(`     ${problem}`)
  }
  console.log(`${entries.length - failed} proven, ${failed} failed`)
  return failed ? 1 : 0
}

function propose([id, ...incident]) {
  const found = id && findRule(id, 'proposed')
  if (!found) return fail(`write the rule to ${join(home(), 'proposed', `${id ?? '<id>'}.md`)} first`)
  const entry = loadFile(found.file)
  const problems = proofOf(entry)
  if (problems.length) return fail(notProven(id, problems))
  const root = cwdRoot()
  recordFailure({
    repo: root ? repoName(root) : '',
    source: 'user correction',
    what_happened: incident.join(' ') || entry.rule.text,
    evidence: entry.rule.bad.split('\n')[0].slice(0, 200),
    rule_or_check: id,
  })
  log({ type: 'propose', rule: id })
  console.log(`Proposed ${id}: the Bad example triggers it and the Good example passes.`)
  console.log(`The user approves it with "! notwice approve ${id}" in Claude Code or "notwice approve ${id}" in a terminal.`)
  return 0
}

function approve(ids) {
  return eachId(ids, approveOne)
}

function approveOne(id) {
  const found = findRule(id, 'proposed')
  if (!found) return fail(`no proposed rule "${id}"`)
  if (lstatSync(found.file).isSymbolicLink()) return fail(`${id} is a symlink; copy the rule file into proposed/ first`)
  const problems = proofOf(loadFile(found.file))
  if (problems.length) return fail(notProven(id, problems))
  if (!moveTo(found, 'rules')) return fail(`an active rule "${id}" already exists`)
  recordRulesHash()
  log({ type: 'approve', rule: id })
  console.log(`Approved ${id} (${found.location.name}). Hooks enforce it from now on.`)
  return 0
}

function retire(ids) {
  return eachId(ids, retireOne)
}

function retireOne(id) {
  const found = findRule(id, 'rules') ?? findRule(id, 'proposed')
  const target = found && moveTo(found, 'retired')
  if (!target) return fail(`no active or proposed rule "${id}" (or it is already retired)`)
  recordRulesHash()
  log({ type: 'retire', rule: id })
  console.log(`Retired ${id}: ${target}`)
  return 0
}

function check(args) {
  const root = cwdRoot()
  if (!root) return fail('not inside a git repository')
  const ci = args.includes('--ci')
  const base = flag(args, '--base')
  const change = ci && ciChange(root, { base, prTitle: flag(args, '--pr-title'), prBodyFile: flag(args, '--pr-body-file') })
  const result = ci ? change && ciResult(root, change) : localResult(root, base)
  if (!result) return fail(ci ? 'cannot find the PR base commit; check out the full history (fetch-depth: 0)' : `cannot resolve base ${base}`)
  console.log(formatResult(result, flag(args, '--format') ?? (process.env.GITHUB_ACTIONS === 'true' ? 'github' : 'text')))
  return blocking(result).length ? 1 : 0
}

function localResult(root, baseRef) {
  const rules = loadRules(root)
  const base = baseRef ? baseCommit(root, baseRef) : (baseCommit(root) ?? 'HEAD')
  if (!base) return null
  return merge(scanRange(root, rules, [base], 'HEAD', worktreeTree(root)), checkSize(rules, numstat(root, base, 'HEAD')))
}

function gitHook([event, ...args]) {
  return runGitHook(cwdRoot(), event, args, event === 'pre-push' ? readFileSync(0, 'utf8') : '')
}

function setHooks(args, install) {
  const global = args.includes('--global')
  if (!global && !cwdRoot()) return fail('not inside a git repository; use --global for every repo')
  const problem = setGitHooks(process.cwd(), { install, global, bin: process.argv[1] })
  if (problem) return fail(problem)
  const where = global ? 'every repo (global git config)' : cwdRoot()
  if (install) console.log(`Installed notwice pre-commit, commit-msg and pre-push hooks for ${where}. ${ALONGSIDE}`)
  else console.log(`Removed notwice git hooks from ${where}.${!global && hasGlobalHooks() ? GLOBAL_LEFT : ''}`)
  return 0
}

const ALONGSIDE = 'They run alongside husky, lefthook and core.hooksPath.'
const GLOBAL_LEFT = ' They are still installed globally; remove them with notwice uninstall-git-hooks --global.'
const hasGlobalHooks = () => Boolean(git(process.cwd(), 'config', '--global', '--get-regexp', '^hook\\.notwice-'))

const fired = (e) => e.type === 'violation' || e.type === 'override'
const STAT_COLUMNS = [(e) => e.type === 'violation', (e) => e.blocked, (e) => e.type === 'override']

function stats() {
  const events = groupBy(readJsonl('log.jsonl'), (e) => e.rule)
  const eventsOf = (rule) => events.get(rule.id) ?? []
  const rules = loadRules(cwdRoot())
  console.log(`${'rule'.padEnd(28)} ${'fires'.padStart(6)} ${'blocks'.padStart(6)} ${'allows'.padStart(6)}  last fired`)
  for (const rule of rules) {
    const list = eventsOf(rule)
    const counts = STAT_COLUMNS.map((test) => String(list.filter(test).length).padStart(6))
    console.log(`${rule.id.padEnd(28)} ${counts.join(' ')}  ${list.findLast(fired)?.ts.slice(0, 10) ?? 'never'}`)
  }
  const lastUse = (rule) => Date.parse(eventsOf(rule).findLast((e) => fired(e) || e.type === 'approve')?.ts) || 0
  const stale = rules.filter((rule) => rule.source !== 'built-in' && lastUse(rule) < Date.now() - 60 * DAY_MS)
  if (stale.length) console.log(`\nUnused for 60 days, prune candidates: ${stale.map((r) => r.id).join(', ')}`)
  else console.log('\nNo rule has gone 60 days without firing.')
  const errors = (readText(join(home(), 'errors.log')) ?? '').split('\n').filter(Boolean).length
  if (errors) console.log(`${errors} hook error line(s) in ${join(home(), 'errors.log')}`)
  return 0
}

function memory(args) {
  const report = inventory(locations(cwdRoot()))
  console.log(args.includes('--json') ? JSON.stringify(report, null, 2) : formatInventory(report))
  return 0
}

function agents(args) {
  const days = args.includes('--all') ? Infinity : Number(flag(args, '--days') ?? 1)
  console.log(formatAgents({ since: Date.now() - days * DAY_MS }))
  return 0
}

const ADAPTERS = { claude, codex }

function hook(args) {
  const adapter = ADAPTERS[flag(args, '--agent') ?? 'claude']
  if (!adapter) return fail(`unknown agent; use one of ${Object.keys(ADAPTERS).join(', ')}`)
  try {
    const output = adapter.handle(JSON.parse(readFileSync(0, 'utf8')))
    if (output) process.stdout.write(JSON.stringify(output))
  } catch (error) {
    logError(error)
  }
  return 0
}
