import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { parseArgs } from 'node:util'
import { readJsonLines } from '../lib.mjs'
import { CODE_RULES, GLOBS } from './distractors-code.mjs'
import { COMMANDS, GIT_TEXT, IMPORTS, INFRA, MARKDOWN, NAMING, SECRETS, WORDS } from './distractors-other.mjs'
import { CORPUS } from './corpus.mjs'

const SCALE_DIR = new URL('.', import.meta.url).pathname
const SIZES = [12, 150, 1000]
const SEED = 20261122

const { values: opts } = parseArgs({ options: { ratchet: { type: 'string' }, tmp: { type: 'string' } } })
process.env.RATCHET_HOME = join(opts.tmp, 'gen-home')
const { parseRule } = await import(join(opts.ratchet, 'src', 'rules.mjs'))
const { prove, checkLines, checkCommand } = await import(join(opts.ratchet, 'src', 'check.mjs'))

const TARGETS = {
  'no-claude-attribution': 'starter', 'tests-after-code': 'starter', 'no-em-dash': 'test/fixtures/rules',
  'pr-close-needs-reason': 'test/fixtures/rules', 'pr-no-extra-sections': 'test/fixtures/rules', 'pr-sections': 'test/fixtures/rules',
}
const CLONE_INERT = {
  'max-pr-size': 'starter', 'no-private-key': 'starter', 'no-print-p8': 'starter', 'wait-in-background': 'starter',
  'no-async-iife': 'test/fixtures/rules', 'no-narrating-comments': 'test/fixtures/rules', 'no-negation-correction': 'test/fixtures/rules',
  'no-pr-assets-branch': 'test/fixtures/rules',
}

const LIVE = [
  {
    id: 'git-add-by-name', family: 'git', targets: ['commands'],
    pattern: String.raw`\bgit\s+(?:add\s+(?:[^;&|\n]*\s)?(?:-A|--all|-u|\.)(?=\s|$|[;&|)])|commit\s+(?:[^;&|\n]*\s)?(?<!-)-[a-zA-Z]*a[a-zA-Z]*\b)`,
    text: 'Stage files by name. Never use git add -A, git add --all, git add . or git commit -a.',
    bad: 'git add -A && git commit -m "Add slugify"', good: 'git add src/slugify.js test/slugify.test.js',
  },
  {
    id: 'commit-body-wrap', family: 'git', targets: ['commits'], pattern: '^.{73,}$',
    text: 'Wrap commit message lines at 72 characters.',
    bad: 'Add slugify helper that lowercases text, trims it and joins the words with dashes',
    good: 'Add slugify helper\n\nLowercases text, trims it and joins the words with dashes.',
  },
  {
    id: 'writing-no-hype-words', family: 'style', targets: ['commits', 'pr', 'comments'], flags: 'i',
    pattern: String.raw`\b(?:robust(?:ly|ness)?|seamless(?:ly)?|comprehensive(?:ly)?|leverag(?:e|es|ed|ing)|utiliz(?:e|es|ed|ing|ation)|delv(?:e|es|ed|ing))\b`,
    text: 'No hype words in commits, PRs or comments: robust, seamless, comprehensive, leverage, utilize, delve.',
    bad: 'Add robust slug handling', good: 'Add slug handling for accented letters',
  },
  {
    id: 'md-no-emphasis-line', family: 'style', targets: ['files'], paths: GLOBS.md,
    pattern: String.raw`^\s*(?:\*\*?|__?)[^*_\s][^*_]*(?:\*\*?|__?)\s*$`,
    text: 'In Markdown, never use a bold or italic line as a heading or tagline (MD036). Write a plain sentence or a real heading.',
    bad: '*Fast CSV cleanup for everyone.*', good: 'Fast CSV cleanup for everyone.',
  },
  {
    id: 'js-number-isnan', family: 'language', targets: ['files'], paths: GLOBS.jsts,
    pattern: String.raw`(?<![\w.$])is(?:NaN|Finite)\(`,
    text: 'Use Number.isNaN and Number.isFinite, never the global isNaN or isFinite.',
    bad: 'if (isNaN(value)) return min', good: 'if (Number.isNaN(value)) return min',
  },
  {
    id: 'no-single-letter-names', family: 'naming', targets: ['files'], paths: GLOBS.jsts,
    pattern: String.raw`\b(?:const|let|var)\s+(?![ijk]\b)[a-zA-Z]\s*[=:]`,
    text: 'Name variables for what they hold: no single-letter names except i, j and k (ESLint id-length).',
    bad: 'const v = Math.min(value, max)', good: 'const limited = Math.min(value, max)',
  },
]

const SECRET_TEXTS = [
  (s) => `Never commit a ${s.name}. Read it from ${s.env} at runtime.`,
  (s) => `No ${s.name} in code, commits, PRs or comments; load it from the environment (${s.env}).`,
  (s) => `A ${s.name} belongs in the secret manager, never in the repo. Reference ${s.env} instead.`,
  (s) => `Do not paste a ${s.name} anywhere in the repo or on GitHub; pass it through ${s.env}.`,
]
const IMPORT_TEXTS = [
  (m, r) => `Do not import ${m}; use ${r}.`,
  (m, r) => `${m} is banned in this codebase. Use ${r} instead.`,
  (m, r) => `Replace ${m} with ${r}.`,
  (m, r) => `No new code depends on ${m}; reach for ${r}.`,
]
const WORD_TEXTS = [
  (w, a) => `Do not write "${w}" in commits, PRs or comments; ${a}.`,
  (w, a) => `"${w}" is banned in commit messages and PR text: ${a}.`,
  (w, a) => `Cut "${w}" from anything posted to GitHub; ${a}.`,
]
const IMPORT_GLOBS = { js: GLOBS.jsts, py: GLOBS.py, go: GLOBS.go, rust: ['*.rs', 'Cargo.toml'], java: GLOBS.java, kt: GLOBS.kt, cs: GLOBS.cs, swift: GLOBS.swift, ruby: GLOBS.gemfile, dart: GLOBS.dart }

function random(seed) {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const hashOf = (text) => [...text].reduce((h, c) => (Math.imul(h, 31) + c.charCodeAt(0)) >>> 0, 7)
const escapeRegExp = (text) => text.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&')
const slug = (text) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
const identifier = (text) => text.replace(/^@/, '').split(/[^a-zA-Z0-9]+/).filter(Boolean).map((w, i) => (i ? w[0].toUpperCase() + w.slice(1) : w)).join('') || 'lib'

const CHARSETS = {
  an: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789', al: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
  up: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', hex: '0123456789abcdef', HEX: '0123456789ABCDEF', d: '0123456789',
  lan: 'abcdefghijklmnopqrstuvwxyz0123456789', b64: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/',
}

function fillSample(template, seed) {
  const next = random(seed)
  return template.replace(/\{(\w+):(\d+)\}/g, (_, set, n) => Array.from({ length: Number(n) }, () => CHARSETS[set][Math.floor(next() * CHARSETS[set].length)]).join(''))
}

const fromCode = ([id, glob, pattern, text, bad, good, o = {}], family) => ({
  id, family, pattern, text, bad, good, flags: o.flags, severity: o.severity, targets: o.targets ?? ['files'], paths: o.paths ?? (glob ? GLOBS[glob] : undefined),
})

function fromSecret([id, name, pattern, sample, env, o = {}]) {
  const filled = fillSample(sample, hashOf(id))
  const text = SECRET_TEXTS[hashOf(id) % SECRET_TEXTS.length]({ name, env })
  return { id, family: 'security', pattern, flags: o.flags, text, targets: ['files', 'commits', 'pr', 'comments'], bad: o.line ? filled : `${env}=${filled}`, good: `${env}=\${${env}}` }
}

function importPattern(eco, module, exact) {
  const m = escapeRegExp(module)
  if (eco === 'js') return String.raw`(?:\bfrom\s+|\brequire\(\s*|\bimport\(\s*|^\s*import\s+)['"]${m}${exact ? '' : String.raw`(?:/[^'"]*)?`}['"]`
  if (eco === 'py') return String.raw`^\s*(?:import\s+${m}(?:\s|\.|,|$)|from\s+${m}(?:\s|\.))`
  if (eco === 'go') return String.raw`^\s*(?:import\s+)?(?:[\w.]+\s+)?"${m}(?:/[^"]*)?"`
  if (eco === 'rust') return String.raw`^\s*(?:pub\s+)?use\s+${m}::|^\s*extern\s+crate\s+${m}\b|^${escapeRegExp(module.replaceAll('_', '-'))}\s*=`
  if (eco === 'java' || eco === 'kt') return String.raw`^\s*import\s+(?:static\s+)?${m}${module.endsWith('.') ? '' : String.raw`\b`}`
  if (eco === 'cs') return String.raw`^\s*using\s+${m}\s*;`
  if (eco === 'swift') return String.raw`^\s*import\s+${m}\b`
  if (eco === 'ruby') return String.raw`^\s*gem\s+['"]${m}['"]`
  return String.raw`^\s*import\s+['"]${m}[/'"]`
}

function importBad(eco, module) {
  if (eco === 'js') return `import ${identifier(module)} from '${module}'`
  if (eco === 'py') return `import ${module}`
  if (eco === 'go') return `import "${module}"`
  if (eco === 'rust') return `use ${module}::Thing;`
  if (eco === 'java') return `import ${module}${module.endsWith('.') ? 'Legacy' : ''};`
  if (eco === 'kt') return `import ${module}${module.endsWith('.') ? 'Legacy' : ''}`
  if (eco === 'cs') return `using ${module};`
  if (eco === 'swift') return `import ${module}`
  if (eco === 'ruby') return `gem '${module}'`
  return `import '${module}${module.startsWith('package:') ? '/legacy.dart' : ''}';`
}

function fromImport([eco, module, replacement, good, o = {}]) {
  const id = `${eco}-no-${slug(module)}`
  return {
    id, family: 'dependencies', pattern: importPattern(eco, module, o.exact), targets: ['files'], paths: IMPORT_GLOBS[eco],
    text: IMPORT_TEXTS[hashOf(id) % IMPORT_TEXTS.length](module, replacement), bad: importBad(eco, module), good,
  }
}

const fromCommand = ([id, pattern, text, bad, good, o = {}]) => ({ id, family: 'commands', pattern, text, bad, good, flags: o.flags, targets: ['commands'] })

function fromWord([id, pattern, words, advice, o = {}]) {
  const targets = o.mdOnly ? ['files'] : o.files ? ['files', 'commits', 'pr', 'comments'] : ['commits', 'pr', 'comments']
  const paths = targets.includes('files') ? ['*.{md,mdx,txt}'] : undefined
  const text = WORD_TEXTS[hashOf(id) % WORD_TEXTS.length](words, advice)
  return { id, family: 'writing', pattern, flags: 'i', text, targets, paths, bad: words, good: 'Update the uploader retry logic.' }
}

const fromMarkdown = ([id, pattern, text, bad, good, o = {}]) => ({ id, family: 'docs', pattern, text, bad, good, flags: o.flags, targets: ['files'], paths: GLOBS.md })
const fromGitText = ([id, targets, pattern, text, bad, good, o = {}]) => ({ id, family: 'git', pattern, text, bad, good, flags: o.flags, targets })

const FAMILY_OF_CODE = (id) => {
  if (/^(react|next|rn|vue|angular|svelte|express|django|flask|fastapi|rails|laravel|spring|swiftui|compose|android)-/.test(id)) return 'framework'
  if (/^(test|pytest|rspec|cypress|playwright)-|-test-/.test(id)) return 'testing'
  if (/(?:^|-)(?:no-(?:eval|exec|pickle|yaml-load|shell-true|os-system|verify-false|md5|weak|tls|jwt|alg|child|inner|outer|insert|marshal|unserialize|random|chmod|hardcoded|ecb|sql|cursor|csrf|cors|danger|bypass|mark-safe|html-safe|raw|arbitrary|cleartext|debuggable|allow-backup|js-interface|world|echo-request|send-params|tempfile|create-cipher|math-random|localstorage|postmessage|binary-formatter|runtime-exec|curl))/.test(id)) return 'security'
  if (/(?:names?|naming|prefix|camel|pascal|hungarian|abbrev|upper|lowercase|receiver|get-prefix|underscore)/.test(id)) return 'naming'
  return 'language'
}

function buildAll() {
  return [
    ...CODE_RULES.map((row) => fromCode(row, FAMILY_OF_CODE(row[0]))),
    ...SECRETS.map(fromSecret),
    ...IMPORTS.map(fromImport),
    ...COMMANDS.map(fromCommand),
    ...WORDS.map(fromWord),
    ...MARKDOWN.map(fromMarkdown),
    ...INFRA.map((row) => fromCode(row, 'infra')),
    ...GIT_TEXT.map(fromGitText),
    ...NAMING.map((row) => fromCode(row, 'naming')),
  ]
}

const quote = (text) => `'${String(text).replaceAll("'", "''")}'`

function ruleFile(rule) {
  const front = ['---', `kind: forbid`, `pattern: ${quote(rule.pattern)}`]
  if (rule.flags) front.push(`flags: ${rule.flags}`)
  front.push(`targets: [${rule.targets.join(', ')}]`)
  if (rule.paths) front.push(`paths: [${rule.paths.map(quote).join(', ')}]`)
  front.push(`severity: ${rule.severity ?? 'block'}`, `from: benchmark distractor (${rule.family})`, '---')
  return [...front, rule.text, '', '## Bad', '~~~~', rule.bad, '~~~~', '', '## Good', '~~~~', rule.good, '~~~~', ''].join('\n')
}

function proven(source, file) {
  try {
    const rule = parseRule(source, file)
    const problems = prove(rule)
    return problems.length ? { problems } : { rule }
  } catch (error) {
    return { problems: [error.message] }
  }
}

function corpusHits(rule) {
  const lines = (list) => list.flatMap(({ file, text }) => text.split('\n').map((t, i) => ({ file, line: i + 1, text: t })))
  const hits = [
    ...checkLines([rule], lines(CORPUS.files), 'files').violations,
    ...checkLines([rule], lines(CORPUS.commits.map((text) => ({ file: 'commit', text }))), 'commits').violations,
    ...checkLines([rule], lines(CORPUS.comments.map((text) => ({ file: 'comment', text }))), 'comments').violations,
    ...checkLines([rule], lines(CORPUS.pr.map((text) => ({ file: 'pr', text }))), 'pr').violations,
    ...CORPUS.commands.flatMap((command) => checkCommand([rule], command).violations),
  ]
  return hits.map((v) => `${v.where}: ${v.excerpt}`)
}

function shuffle(list, seed) {
  const next = random(seed)
  const copy = [...list]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(next() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

function main() {
  const commandLog = readJsonLines(join(SCALE_DIR, '..', 'results.jsonl')).flatMap((r) => r.commands ?? [])
  CORPUS.commands.push(...new Set(commandLog))
  const outDir = join(SCALE_DIR, 'rules')
  rmSync(outDir, { recursive: true, force: true })
  mkdirSync(outDir, { recursive: true })
  const report = { rejected: [], inertDropped: [], liveCorpusHits: {} }
  const families = {}
  const seen = new Set()
  const accept = (id, source, family) => {
    if (seen.has(id)) throw new Error(`duplicate id ${id}`)
    seen.add(id)
    families[id] = family
    writeFileSync(join(outDir, `${id}.md`), source)
  }

  for (const [id, dir] of Object.entries(TARGETS)) accept(id, readFileSync(join(opts.ratchet, dir, `${id}.md`), 'utf8'), 'target')
  for (const live of LIVE) {
    const source = ruleFile(live)
    const result = proven(source, `${live.id}.md`)
    if (!result.rule) throw new Error(`live rule ${live.id}: ${result.problems.join('; ')}`)
    report.liveCorpusHits[live.id] = corpusHits(result.rule).slice(0, 5)
    accept(live.id, source, live.family)
  }

  const inert = []
  const cloneInert = Object.entries(CLONE_INERT).map(([id, dir]) => ({ id, family: 'user-rule', source: readFileSync(join(opts.ratchet, dir, `${id}.md`), 'utf8') }))
  for (const candidate of [...cloneInert, ...buildAll().map((rule) => ({ id: rule.id, family: rule.family, source: ruleFile(rule) }))]) {
    if (seen.has(candidate.id) || inert.some((r) => r.id === candidate.id)) throw new Error(`duplicate id ${candidate.id}`)
    const result = proven(candidate.source, `${candidate.id}.md`)
    if (!result.rule) {
      report.rejected.push({ id: candidate.id, problems: result.problems })
      continue
    }
    const hits = result.rule.kind === 'forbid' ? corpusHits(result.rule) : []
    if (hits.length) {
      report.inertDropped.push({ id: candidate.id, hits: hits.slice(0, 3) })
      continue
    }
    inert.push(candidate)
  }

  const needed = 1000 - Object.keys(TARGETS).length - LIVE.length
  if (inert.length < needed) throw new Error(`only ${inert.length} inert rules passed, need ${needed}`)
  const ordered = shuffle(inert, SEED).slice(0, needed)
  for (const rule of ordered) accept(rule.id, rule.source, rule.family)

  const core = [...Object.keys(TARGETS), ...LIVE.map((l) => l.id)]
  const sets = Object.fromEntries(SIZES.map((size) => [size, [...core, ...ordered.slice(0, size - core.length).map((r) => r.id)].sort()]))
  const familyCounts = Object.fromEntries(SIZES.map((size) => [size, Object.groupBy(sets[size], (id) => families[id])]).map(([size, groups]) => [size, Object.fromEntries(Object.entries(groups).map(([f, ids]) => [f, ids.length]))]))
  writeFileSync(join(SCALE_DIR, 'rule-sets.json'), `${JSON.stringify({ seed: SEED, targets: Object.keys(TARGETS), live: LIVE.map((l) => l.id), families, familyCounts, sets }, null, 1)}\n`)
  writeFileSync(join(SCALE_DIR, 'gen-report.json'), `${JSON.stringify({ candidates: inert.length + report.rejected.length + report.inertDropped.length, passed: inert.length, ...report }, null, 1)}\n`)
  console.log(`inert candidates passed ${inert.length}, rejected ${report.rejected.length}, dropped by corpus ${report.inertDropped.length}`)
  console.log(JSON.stringify(familyCounts))
}

main()
