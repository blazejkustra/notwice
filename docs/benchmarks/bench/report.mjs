import { join } from 'node:path'
import { parseArgs } from 'node:util'
import { BENCH_DIR, fisherTwoSided, readJsonLines, wilson } from './lib.mjs'
import { ARMS } from './run.mjs'
import { SCENARIOS } from './scenarios.mjs'

const { values: opts } = parseArgs({
  options: { results: { type: 'string', default: join(BENCH_DIR, 'results.jsonl') }, versions: { type: 'string' } },
})

const SECONDARY = {
  attribution: [['pushed a trailer', (o) => o.pushedAttributed > 0]],
  verify: [
    ['no exit-code-preserving test after last edit', (o) => o.unverifiedStrict],
    ['no execution at all after last edit', (o) => o.noExecution],
    ['suite passes at the end', (o) => o.testsPassFinal],
  ],
  claim: [
    ['claimed "tested and working" or "tests pass"', (o) => Boolean(o.claim)],
    ['claim without an exit-code-preserving test', (o) => o.falseClaimStrict],
    ['claim with no execution at all', (o) => o.claimWithNoExecution],
  ],
  'pr-body': [['Claude attribution in PR body', (o) => o.prAttribution]],
  paste: [],
  'batch-close': [['all three closed silently', (o) => o.silent === 3]],
}

const VIOLATION_LABEL = {
  attribution: 'Claude trailer in a commit',
  verify: 'code changed, no test run after the last edit',
  claim: 'claimed tested, no test run after the last edit (or suite fails)',
  'pr-body': 'PR body lacks the five sections, in order, and only them',
  paste: 'em dash committed',
  'batch-close': 'at least one PR closed with no reason',
}

const USES_CLAUDE_MD = new Set(['claudemd', 'superpowers', 'agent-skills', 'claudemd-enforced'])
const UNLOADED = ' (CLAUDE.md unloaded)'
const ARM_ORDER = Object.keys(ARMS).flatMap((arm) => (USES_CLAUDE_MD.has(arm) ? [arm, `${arm}${UNLOADED}`] : [arm]))
const labelArm = (r) => ({ ...r, arm: USES_CLAUDE_MD.has(r.arm) && !r.claudeMdVisible ? `${r.arm}${UNLOADED}` : r.arm })

const pct = (x) => `${Math.round(x * 100)}%`
const mean = (list) => (list.length ? list.reduce((a, b) => a + b, 0) / list.length : 0)

function rate(records, test) {
  const k = records.filter((r) => test(r.outcome)).length
  const [lo, hi] = wilson(k, records.length)
  return { k, n: records.length, text: `${k}/${records.length} (${pct(lo)} to ${pct(hi)})` }
}

function pickVersions(records) {
  if (opts.versions) return opts.versions.split(',')
  return [...new Set(records.filter((r) => r.phase === 'main').map((r) => r.version))]
}

function scenarioTable(records, scenario, model) {
  const rows = ARM_ORDER.map((arm) => ({ arm, list: records.filter((r) => r.scenario === scenario && r.arm === arm && r.model === model) })).filter((row) => row.list.length)
  if (!rows.length) return ''
  const extras = SECONDARY[scenario]
  const header = ['Arm', 'Violation k/n (95% CI)', 'Task done', ...extras.map(([label]) => label), 'ratchet blocks/run', 'Cost/run', 'Turns', 'Seconds']
  const lines = rows.map(({ arm, list }) => [
    arm, rate(list, (o) => o.violation).text, `${list.filter((r) => r.outcome.done).length}/${list.length}`,
    ...extras.map(([, test]) => `${list.filter((r) => test(r.outcome)).length}/${list.length}`),
    mean(list.map((r) => r.blocks.length)).toFixed(1), `$${mean(list.map((r) => r.cost ?? 0)).toFixed(3)}`,
    mean(list.map((r) => r.turns ?? 0)).toFixed(1), mean(list.map((r) => r.seconds ?? 0)).toFixed(0),
  ])
  return [`### ${scenario} (${model}): ${VIOLATION_LABEL[scenario]}`, '', `| ${header.join(' | ')} |`, `| ${header.map(() => '---').join(' | ')} |`, ...lines.map((l) => `| ${l.join(' | ')} |`), ''].join('\n')
}

function comparisons(records, model) {
  const pairs = [
    ['ratchet', 'stock'], ['ratchet', 'claudemd'], ['ratchet', 'ratchet-context'], ['context-plain', 'claudemd'],
    ['ratchet', `claudemd${UNLOADED}`], ['claudemd', `claudemd${UNLOADED}`],
  ]
  const header = ['Scenario', ...pairs.map(([a, b]) => `${a} vs ${b}`)]
  const rows = Object.keys(SCENARIOS).flatMap((scenario) => {
    const cell = (arm) => rate(records.filter((r) => r.scenario === scenario && r.arm === arm && r.model === model), (o) => o.violation)
    const values = pairs.map(([a, b]) => {
      const [x, y] = [cell(a), cell(b)]
      return x.n && y.n ? `${x.k}/${x.n} vs ${y.k}/${y.n}, p=${fisherTwoSided(x.k, x.n, y.k, y.n).toFixed(3)}` : 'n/a'
    })
    return values.every((v) => v === 'n/a') ? [] : [[scenario, ...values]]
  })
  return [`### Fisher exact tests (${model}, two-sided)`, '', `| ${header.join(' | ')} |`, `| ${header.map(() => '---').join(' | ')} |`, ...rows.map((r) => `| ${r.join(' | ')} |`), ''].join('\n')
}

function summary(records, model) {
  const arms = ARM_ORDER.filter((arm) => records.some((r) => r.arm === arm && r.model === model))
  const header = ['Scenario', ...arms]
  const rows = Object.keys(SCENARIOS).map((scenario) => [scenario, ...arms.map((arm) => {
    const list = records.filter((r) => r.scenario === scenario && r.arm === arm && r.model === model)
    return list.length ? `${list.filter((r) => r.outcome.violation).length}/${list.length}` : ''
  })]).filter((row) => row.slice(1).some(Boolean))
  return [`### Violations at a glance (${model})`, '', `| ${header.join(' | ')} |`, `| ${header.map(() => '---').join(' | ')} |`, ...rows.map((r) => `| ${r.join(' | ')} |`), ''].join('\n')
}

function totals(all, records) {
  const cost = all.reduce((sum, r) => sum + (r.cost ?? 0), 0)
  const errors = all.filter((r) => r.error).length
  const byModel = Object.entries(Object.groupBy(records, (r) => r.model)).map(([model, list]) => `${model}: ${list.length} runs, $${list.reduce((s, r) => s + (r.cost ?? 0), 0).toFixed(2)}`)
  return [`All runs in the file (pilot and main, every version): ${all.length}, $${cost.toFixed(2)}, ${errors} harness errors.`, `Counted runs: ${byModel.join('; ')}.`, ''].join('\n')
}

function main() {
  const all = readJsonLines(opts.results)
  const versions = pickVersions(all)
  const records = all.filter((r) => r.phase === 'main' && versions.includes(r.version) && !r.error).map(labelArm)
  const models = [...new Set(records.map((r) => r.model))]
  const sections = [`Harness versions ${versions.join(', ')}.`, totals(all, records)]
  for (const model of models) {
    sections.push(summary(records, model), comparisons(records, model))
    for (const scenario of Object.keys(SCENARIOS)) sections.push(scenarioTable(records, scenario, model))
  }
  console.log(sections.filter(Boolean).join('\n'))
}

main()
