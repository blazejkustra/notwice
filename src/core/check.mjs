import { statusText } from './command.mjs'
import { parseNumstat } from './git.mjs'
import { escapeRegExp, globToRegExp } from './rules.mjs'
import { groupBy, log, logError } from './store.mjs'

const IGNORED = [
  '*.lock', 'bun.lockb', 'package-lock.json', 'npm-shrinkwrap.json', 'pnpm-lock.yaml', 'go.sum', 'Package.resolved',
  '**/__snapshots__/**', '*.snap',
  '*.min.js', '*.min.css', '*.map', '*.generated.*', '*.g.dart', '*.pb.go', '*_pb2.py', '**/dist/**',
  '**/.notwice/**',
].map(globToRegExp)

export const isIgnored = (file) => IGNORED.some((re) => re.test(file))
const MAX_LINE = 10000
const MAX_EXCERPT = 200
const lowered = (text) => text.slice(0, MAX_LINE).toLowerCase()

function safely(rule, fallback, fn) {
  try {
    return fn()
  } catch (error) {
    logError(`${rule.id}: ${error.message}`)
    return fallback
  }
}

function eachRule(rules, check) {
  for (const rule of rules) safely(rule, null, () => check(rule))
}

function hits(rule, text, lower = lowered(text)) {
  const line = text.slice(0, MAX_LINE)
  if (rule.needles && !rule.needles.some((needle) => (rule.caseless ? lower : line).includes(needle))) return false
  return safely(rule, false, () => rule.patterns.some((re) => re.test(line)) && !rule.unless?.test(line))
}

const allowed = (text, rule) => !rule.locked && new RegExp(`notwice-allow ${escapeRegExp(rule.id)}(?![\\w-])`).test(text)
const appliesTo = (rule, { file, ignored }) => (rule.locked || !ignored) && (!rule.paths || rule.paths.some((re) => re.test(file)))
const ofKind = (rules, kind, target, inMain) => rules.filter((r) => r.kind === kind && r.targets.includes(target) && (inMain || !r.main))

export const withoutRequire = (rules) => rules.filter((r) => r.kind !== 'require')
export const blocking = (result) => result.violations.filter((v) => v.severity === 'block')
export const warnings = (result) => result.violations.filter((v) => v.severity === 'warn')

function record(result, rule, text, where, excerpt) {
  const entry = { id: rule.id, severity: rule.severity, locked: rule.locked, text: rule.text, where, excerpt: excerpt.trim() }
  if (allowed(text, rule)) result.overrides.push(entry)
  else result.violations.push(entry)
}

export function merge(...results) {
  return {
    violations: results.flatMap((r) => r.violations),
    overrides: results.flatMap((r) => r.overrides),
  }
}

export function checkLines(rules, lines, target, inMain = false) {
  const result = merge()
  const files = byFile(lines)
  eachRule(ofKind(rules, 'forbid', target, inMain), (rule) => {
    for (const group of files) {
      if (target === 'files' && !appliesTo(rule, group)) continue
      for (const { line, text, lower } of group.lines) {
        if (hits(rule, text, lower)) record(result, rule, text, `${group.file}:${line}`, text.slice(0, MAX_EXCERPT))
      }
    }
  })
  return result
}

function byFile(lines) {
  const prepared = lines.map((l) => ({ ...l, lower: lowered(l.text) }))
  return [...groupBy(prepared, (l) => l.file)].map(([file, list]) => ({ file, ignored: isIgnored(file), lines: list }))
}

export function checkText(rules, text, target, label) {
  const lines = text.split('\n').map((t, i) => ({ file: label, line: i + 1, text: t }))
  const result = checkLines(rules, lines, target)
  eachRule(ofKind(rules, 'require', target), (rule) => {
    const missing = missingPattern(rule, text)
    if (missing) record(result, rule, text, label, `missing or out of order: ${missing.source}`)
  })
  return result
}

export const checkCommits = (rules, list) => merge(...list.map((c) => checkText(rules, c.message, 'commits', `commit ${c.sha}`)))

export function checkCommand(rules, text, allowText = text, inMain = false) {
  const result = merge()
  const lower = lowered(text)
  eachRule(ofKind(rules, 'forbid', 'commands', inMain), (rule) => {
    if (hits(rule, text, lower)) record(result, rule, allowText, 'command', text.slice(0, MAX_EXCERPT))
  })
  return result
}

export function problem(text, where, excerpt) {
  return { violations: [{ id: 'notwice', severity: 'block', locked: true, text, where, excerpt }], overrides: [] }
}

export function checkSize(rules, numstat, allowText = '') {
  const result = merge()
  const added = addedTotal(numstat)
  eachRule(ofKind(rules, 'max-added-lines', 'pr'), (rule) => {
    if (added > rule.max) record(result, rule, allowText, 'branch', `${added} added lines (limit ${rule.max})`)
  })
  return result
}

export function checkOpenPrs(rules, numbers, allowText = '') {
  const result = merge()
  const list = numbers.map((n) => `#${n}`).join(' ')
  eachRule(ofKind(rules, 'max-open-prs', 'pr'), (rule) => {
    if (numbers.length >= rule.max) record(result, rule, allowText, 'repo', `${numbers.length} open PRs (limit ${rule.max}): ${list}`)
  })
  return result
}

export const isCheckRun = (rules, text) => rules.some((rule) => rule.kind === 'verify' && hits(rule, text))

export function checkVerify(rules, events, reply = '', allowText = null) {
  const result = merge()
  eachRule(rules.filter((r) => r.kind === 'verify'), (rule) => {
    const excerpt = unverified(rule, events, reply)
    if (excerpt) record(result, { ...rule, locked: rule.locked || allowText == null }, allowText ?? '', 'verify', excerpt)
  })
  return result
}

const exampleRun = (rule) => rule.suggest ?? rule.good?.match(/^run (.+)$/m)?.[1] ?? 'a passing check'

function unverified(rule, events, reply) {
  const last = (test) => events.findLastIndex(test)
  const edit = last((e) => e.edit != null && !isIgnored(e.edit) && rule.when.some((re) => re.test(e.edit)))
  if (last((e) => e.run != null && hits(rule, e.run)) > edit) return null
  const claim = claimIn(rule, reply)
  const since = edit >= 0 ? `after your last edit (${events[edit].edit})` : 'in this session'
  const how = rule.at === 'pr'
    ? `Wait for one to finish after your last edit, for example: ${exampleRun(rule)}.`
    : `Run one on its own, for example: ${exampleRun(rule)}. A piped (| tail), failed or background run does not count, `
      + 'because its exit code is lost. If it cannot pass, tell the user.'
  if (claim) return `You said "${claim}", but no check passed ${since}. ${how}`
  if (edit <= last((e) => e.waived === rule.id)) return null
  return `${events[edit].edit} changed and no check passed after that. ${how}`
}

const claimIn = (rule, reply) => safely(rule, null, () => rule.claims?.exec(reply.slice(0, MAX_LINE))?.[0].trim())

const TOOL_RUN = /^[\w-]+\(/

function sessionOf(example) {
  const events = []
  const said = []
  for (const line of example.split('\n')) {
    const [, verb, text] = line.match(/^(edit|run|say) (.*)$/) ?? []
    if (verb === 'edit') events.push({ edit: text })
    if (verb === 'run') events.push({ run: TOOL_RUN.test(text) ? text : statusText(text) })
    if (verb === 'say') said.push(text)
  }
  return { events, reply: said.join('\n') }
}

function missingPattern(rule, text) {
  let rest = text
  for (const re of rule.patterns) {
    const match = rest.match(re)
    if (!match) return re
    rest = rest.slice(match.index + match[0].length)
  }
  return null
}

const addedTotal = (numstat) => numstat.filter((e) => !isIgnored(e.file)).reduce((sum, e) => sum + e.added, 0)

export function prove(rule) {
  const problems = []
  if (rule.bad == null) problems.push('no ## Bad example')
  if (rule.good == null) problems.push('no ## Good example')
  if (problems.length) return problems
  if (!fires(rule, rule.bad)) problems.push('the Bad example does not trigger it')
  if (fires(rule, rule.good)) problems.push('the Good example triggers it')
  return problems
}

function fires(rule, example) {
  if (rule.kind === 'forbid') return example.split('\n').some((line) => hits(rule, line))
  if (rule.kind === 'require') return missingPattern(rule, example) !== null
  if (rule.kind === 'verify') {
    const { events, reply } = sessionOf(example)
    return unverified(rule, events, reply) !== null
  }
  if (rule.kind === 'max-open-prs') return (example.match(/#\d+/g) ?? []).length >= rule.max
  return addedTotal(parseNumstat(example)) > rule.max
}

const printable = (text) => text.replace(/[\x00-\x1f\x7f]/g, ' ')

export const describe = (violations) => violations.map((v) => `- ${v.where} [${v.id}] ${v.text}\n    > ${printable(v.excerpt)}`).join('\n')

export function logResult(result, where, { session, sub } = {}, blocks = true) {
  for (const v of result.violations) {
    const blocked = blocks && v.severity === 'block'
    log({ type: 'violation', rule: v.id, severity: v.severity, blocked, where, at: v.where, session, agent: sub?.id })
  }
  for (const v of result.overrides) log({ type: 'override', rule: v.id, where, at: v.where, session, agent: sub?.id })
}
