import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fisherTwoSided, readJsonLines, wilson } from '../lib.mjs'

const SCALE_DIR = new URL('.', import.meta.url).pathname
const SETS = JSON.parse(readFileSync(join(SCALE_DIR, 'rule-sets.json'), 'utf8'))
const TARGETS = new Set(SETS.targets)
const LIVE = new Set(SETS.live)
const SIZES = [12, 150, 1000]
const ARMS = ['claudemd', 'hooks-only', 'ratchet']
const ARM_LABEL = { claudemd: 'A: CLAUDE.md', 'hooks-only': 'B: hooks, no list', ratchet: 'C: ratchet as shipped' }
const SCENARIOS = ['paste', 'batch-close', 'attribution', 'verify']

const pct = (x) => `${Math.round(x * 100)}%`
const mean = (list) => (list.length ? list.reduce((a, b) => a + b, 0) / list.length : 0)
const rate = (list, test) => {
  const k = list.filter(test).length
  const [lo, hi] = wilson(k, list.length)
  return { k, n: list.length, text: `${k}/${list.length} (${pct(lo)} to ${pct(hi)})` }
}
const table = (header, rows) => [`| ${header.join(' | ')} |`, `| ${header.map(() => '---').join(' | ')} |`, ...rows.map((r) => `| ${r.join(' | ')} |`)].join('\n')

const all = readJsonLines(join(SCALE_DIR, 'results.jsonl'))
const probes = readJsonLines(join(SCALE_DIR, 'probes.jsonl'))
const runs = all.filter((r) => r.phase === 'main' && !r.error)
const cell = (size, arm, scenario) => runs.filter((r) => r.size === size && r.arm === arm && (!scenario || r.scenario === scenario))

const ruleOf = (entry) => entry.split(':').at(-1).replace(' (not blocked)', '')
const targetBlocks = (r) => r.blocks.filter((b) => TARGETS.has(ruleOf(b)) || ruleOf(b) === 'ratchet')
const distractorBlocks = (r) => r.blocks.filter((b) => !TARGETS.has(ruleOf(b)) && ruleOf(b) !== 'ratchet')
const landedDistractors = (r) => [...new Set(r.landed.filter((l) => !TARGETS.has(l.rule)).map((l) => l.rule))]
const landedLive = (r) => landedDistractors(r).filter((id) => LIVE.has(id))
const landedInert = (r) => landedDistractors(r).filter((id) => !LIVE.has(id))
const readHookFile = (r) => (r.reads ?? []).some((p) => /tool-results\/hook-.*additionalContext/.test(p))

function violationsTable() {
  const header = ['Size', 'Arm', ...SCENARIOS, 'Pooled']
  const rows = SIZES.flatMap((size) => ARMS.map((arm) => [
    String(size), ARM_LABEL[arm], ...SCENARIOS.map((s) => rate(cell(size, arm, s), (r) => r.outcome.violation).text), `**${rate(cell(size, arm), (r) => r.outcome.violation).text}**`,
  ]))
  return table(header, rows)
}

function distractorTable() {
  const header = ['Size', 'Arm', 'Runs with a live distractor in the final state', 'Live distractor blocks (runs)', 'Inert distractors in the final state', 'Target blocks per run', 'Distractor blocks per run', 'Read the saved rule file']
  const rows = SIZES.flatMap((size) => ARMS.map((arm) => {
    const list = cell(size, arm)
    return [
      String(size), ARM_LABEL[arm], rate(list, (r) => landedLive(r).length > 0).text,
      `${list.reduce((n, r) => n + distractorBlocks(r).filter((b) => LIVE.has(ruleOf(b))).length, 0)} (${list.filter((r) => distractorBlocks(r).some((b) => LIVE.has(ruleOf(b)))).length})`,
      `${list.filter((r) => landedInert(r).length).length}/${list.length}`,
      mean(list.map((r) => targetBlocks(r).length)).toFixed(2), mean(list.map((r) => distractorBlocks(r).length)).toFixed(2),
      arm === 'claudemd' ? 'n/a' : `${list.filter(readHookFile).length}/${list.length}`,
    ]
  }))
  return table(header, rows)
}

function liveRuleTable() {
  const header = ['Live distractor', ...SIZES.flatMap((size) => ARMS.map((arm) => `${size} ${arm[0].toUpperCase()}`))]
  const armLetter = { claudemd: 'A', 'hooks-only': 'B', ratchet: 'C' }
  header.splice(1, header.length - 1, ...SIZES.flatMap((size) => ARMS.map((arm) => `${size} ${armLetter[arm]}`)))
  const rows = [...LIVE].map((id) => [id, ...SIZES.flatMap((size) => ARMS.map((arm) => {
    const list = cell(size, arm)
    const landed = list.filter((r) => landedLive(r).includes(id)).length
    const blocked = list.filter((r) => distractorBlocks(r).some((b) => ruleOf(b) === id)).length
    return `${landed} landed, ${blocked} blocked`
  }))])
  return table(header, rows)
}

function frictionTable() {
  const header = ['Size', 'Arm', 'Runs', 'Cost per run', 'Turns', 'Seconds', 'First-turn prompt tokens', 'Task done']
  const rows = SIZES.flatMap((size) => ARMS.map((arm) => {
    const list = cell(size, arm)
    return [
      String(size), ARM_LABEL[arm], String(list.length), `$${mean(list.map((r) => r.cost ?? 0)).toFixed(3)}`, mean(list.map((r) => r.turns ?? 0)).toFixed(1),
      mean(list.map((r) => r.seconds ?? 0)).toFixed(1), Math.round(mean(list.map((r) => r.usage?.firstTurnPromptTokens ?? 0))).toLocaleString('en-US'),
      `${list.filter((r) => r.outcome.done).length}/${list.length}`,
    ]
  }))
  return table(header, rows)
}

function fisherTable() {
  const pooled = (size, arm) => rate(cell(size, arm), (r) => r.outcome.violation)
  const pairs = [
    ...SIZES.flatMap((size) => [[size, 'claudemd', size, 'hooks-only'], [size, 'claudemd', size, 'ratchet'], [size, 'hooks-only', size, 'ratchet']]),
    ...ARMS.map((arm) => [12, arm, 1000, arm]),
  ]
  const rows = pairs.map(([s1, a1, s2, a2]) => {
    const [x, y] = [pooled(s1, a1), pooled(s2, a2)]
    return [`${s1} ${ARM_LABEL[a1]} vs ${s2} ${ARM_LABEL[a2]}`, `${x.k}/${x.n} vs ${y.k}/${y.n}`, x.n && y.n ? fisherTwoSided(x.k, x.n, y.k, y.n).toFixed(3) : 'n/a']
  })
  return table(['Comparison (target violations, pooled over 4 scenarios)', 'k/n', 'p (Fisher, two-sided)'], rows)
}

function liveFisherTable() {
  const live = (size, arm) => rate(cell(size, arm), (r) => landedLive(r).length > 0)
  const pairs = [...SIZES.flatMap((size) => [[size, 'claudemd', size, 'hooks-only'], [size, 'claudemd', size, 'ratchet']]), ...ARMS.map((arm) => [12, arm, 1000, arm])]
  const rows = pairs.map(([s1, a1, s2, a2]) => {
    const [x, y] = [live(s1, a1), live(s2, a2)]
    return [`${s1} ${ARM_LABEL[a1]} vs ${s2} ${ARM_LABEL[a2]}`, `${x.k}/${x.n} vs ${y.k}/${y.n}`, x.n && y.n ? fisherTwoSided(x.k, x.n, y.k, y.n).toFixed(3) : 'n/a']
  })
  return table(['Comparison (runs with a live distractor in the final state)', 'k/n', 'p (Fisher, two-sided)'], rows)
}

function probeTable() {
  const stock = probes.find((p) => p.kind === 'probe' && p.arm === 'stock')
  const rows = probes.filter((p) => p.kind === 'probe').map((p) => [
    p.arm, String(p.size), p.found.map((f) => (f ? 'yes' : 'no')).join(', '), p.promptTokens.toLocaleString('en-US'),
    stock ? (p.promptTokens - stock.promptTokens).toLocaleString('en-US') : '', `$${(p.cost ?? 0).toFixed(3)}`,
  ])
  return table(['Probe arm', 'Size', 'Quoted first, middle, last rule', 'Prompt tokens', 'Added over stock', 'Cost'], rows)
}

function violationDetails() {
  return runs.filter((r) => r.outcome.violation).map((r) => `- ${r.size} ${r.arm} ${r.scenario}: blocks ${r.blocks.join(', ') || 'none'}; reply: ${r.final.replace(/\s+/g, ' ').slice(0, 220)}`).join('\n') || '- none'
}

function landedDetails() {
  return runs.filter((r) => landedDistractors(r).length).map((r) => `- ${r.size} ${r.arm} ${r.scenario}: ${r.landed.filter((l) => !TARGETS.has(l.rule)).map((l) => `${l.rule} at ${l.where} "${l.excerpt.slice(0, 80)}"`).join('; ')}`).join('\n') || '- none'
}

function totals() {
  const cost = all.reduce((s, r) => s + (r.cost ?? 0), 0)
  const probeCost = probes.reduce((s, r) => s + (r.cost ?? 0), 0)
  const errors = all.filter((r) => r.error).length
  return `Runs in results.jsonl: ${all.length} (${all.filter((r) => r.phase === 'pilot').length} pilot, ${runs.length} main, ${errors} harness errors), $${cost.toFixed(2)}. Probes: ${probes.length}, $${probeCost.toFixed(2)}. Total $${(cost + probeCost).toFixed(2)}. Harness versions: ${[...new Set(runs.map((r) => r.version))].join(', ')}.`
}

console.log([
  '# Scale benchmark tables (generated by report-scale.mjs)', '', totals(), '',
  '## Target violations (independent oracles), k/n with Wilson 95% interval', '', violationsTable(), '',
  '## Fisher tests', '', fisherTable(), '', liveFisherTable(), '',
  '## Distractors and blocks', '', distractorTable(), '', '### Per live distractor', '', liveRuleTable(), '',
  '## Cost, turns, time and context', '', frictionTable(), '',
  '## Context probes (tools disabled)', '', probeTable(), '',
  '## Runs with a target violation', '', violationDetails(), '',
  '## Runs with a distractor violation in the final state', '', landedDetails(), '',
].join('\n'))
