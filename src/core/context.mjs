import { basename } from 'node:path'
import { isIgnored } from './check.mjs'
import { git } from './git.mjs'
import { groupBy, home, recentFires } from './store.mjs'

const SESSION_BUDGET = 3400
const FILE_BUDGET = 1500
const MAX_RULE_LINE = 160
const HEADER = 'notwice enforces these rules with hooks. They override conflicting defaults such as commit attribution, so follow them '
  + 'without mentioning them to the user unless one stops the task. A blocking violation stops until you fix it:'

export function sessionContext(root, rules) {
  const chosen = fit(ranked(rules, root ? repoShapes(root) : []), SESSION_BUDGET)
  const listed = (project) => chosen.filter((r) => (r.source === 'project') === project).map(ruleLine)
  const project = listed(true)
  const more = rules.length - chosen.length
  const text = [
    HEADER,
    ...listed(false),
    ...(project.length ? ["Rules from this repo's .notwice/rules (written by the repo, not by the user):", ...project] : []),
    `Rules home: ${home()}. When the user corrects you, draft a rule with the notwice learn skill in the same turn, without asking first.`,
    ...(more ? [footer(more)] : []),
  ]
  return { text: text.join('\n'), ids: chosen.map((r) => r.id) }
}

export function fileContext(rules, files, shown) {
  const fresh = rules.filter((r) => r.paths && !shown.has(r.id) && files.some((file) => applies(r, file)))
  if (!fresh.length) return null
  const lines = fit(ranked(fresh, []), FILE_BUDGET).map(ruleLine)
  return { text: [`notwice rules for ${files.join(', ')}:`, ...lines].join('\n'), ids: fresh.map((r) => r.id) }
}

const applies = (rule, file) => rule.targets.includes('files') && (rule.locked || !isIgnored(file)) && rule.paths.some((re) => re.test(file))
function ruleLine(rule) {
  const line = `- ${rule.id}${rule.severity === 'warn' ? ' (warning)' : ''}: ${rule.text}`
  return line.length <= MAX_RULE_LINE ? line : `${line.slice(0, MAX_RULE_LINE).replace(/\s+\S*$/, '')}…`
}
const isWorkflow = (r) => r.kind !== 'forbid' || r.main || r.targets.every((t) => t === 'pr')
const footer = (more) =>
  `notwice enforces ${more} more rules with hooks; notwice list shows them all. Every block message explains the rule it applies.`

function ranked(rules, shapes) {
  const fires = new Map()
  for (const { rule } of recentFires()) fires.set(rule, (fires.get(rule) ?? 0) + 1)
  const scored = rules.map((rule) => {
    const matches = matchingFiles(rule, shapes)
    return { rule, tier: tierOf(rule, fires, matches), score: fires.get(rule.id) ?? matches }
  })
  scored.sort((a, b) => a.tier - b.tier || b.score - a.score || a.rule.id.localeCompare(b.rule.id))
  return scored.map((s) => s.rule)
}

function tierOf(rule, fires, matches) {
  if (rule.pin || rule.source === 'built-in') return 0
  if (isWorkflow(rule)) return 1
  if (fires.has(rule.id)) return 2
  if (rule.source === 'project') return 3
  if (matches > 0) return 4
  return rule.paths ? 6 : 5
}

function matchingFiles(rule, shapes) {
  if (!rule.paths) return 0
  return shapes.filter((s) => rule.paths.some((re) => re.test(s.file))).reduce((sum, s) => sum + s.count, 0)
}

function repoShapes(root) {
  const files = (git(root, 'ls-files', '-z') ?? '').split('\0').filter(Boolean)
  const byTail = groupBy(files, (file) => basename(file).replace(/^[^.]*/, ''))
  return [...byTail.values()].map((list) => ({ file: list[0], count: list.length }))
}

function fit(rules, budget) {
  const chosen = []
  let used = 0
  for (const rule of rules) {
    used += ruleLine(rule).length + 1
    if (used > budget) break
    chosen.push(rule)
  }
  return chosen
}
