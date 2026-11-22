import { basename } from 'node:path'

const KINDS = ['forbid', 'require', 'max-added-lines', 'max-open-prs', 'verify']
const TARGETS = ['files', 'commits', 'pr', 'comments', 'commands']
const LIST_ITEM = /\s*(?:'(?:[^']|'')*'|"(?:[^"\\]|\\.)*")\s*|[^,]+/g
const GLOB_PARTS = { '**/': '(?:.*/)?', '**': '.*', '*': '[^/]*', '?': '[^/]' }
const ESCAPE = String.raw`\\u[\da-fA-F]{4}|\\x[\da-fA-F]{2}|\\c[A-Za-z]|\\k<[^>]*>|\\\d+|\\[\s\S]`
const CLASS = String.raw`\[(?:\\[\s\S]|[^\]\\])*\]`
const QUANTIFIER = String.raw`(?:[*+?]|\{\d+(?:,\d*)?\})\??`
const REGEX_TOKEN = new RegExp(String.raw`(${ESCAPE}|${CLASS}|[\s\S])(${QUANTIFIER})?`, 'g')
const CONTROL_ESCAPES = { t: '\t', n: '\n', r: '\r', f: '\f', v: '\v' }

export function parseRule(source, file) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/)
  if (!match) throw new Error(`${file}: missing frontmatter`)
  const meta = parseFrontmatter(match[1])
  const kind = meta.kind
  if (!KINDS.includes(kind)) throw new Error(`${file}: kind must be one of ${KINDS.join(', ')}`)
  const targets = targetsOf(kind, meta.targets)
  const unknown = targets.filter((t) => !TARGETS.includes(t))
  if (unknown.length) throw new Error(`${file}: unknown target ${unknown.join(', ')}`)
  if (kind === 'require' && targets.some((t) => t === 'files' || t === 'commands')) {
    throw new Error(`${file}: require rules check commits, pr or comments`)
  }
  if (meta.severity && !['block', 'warn'].includes(meta.severity)) throw new Error(`${file}: severity must be block or warn`)
  const scopable = kind === 'forbid' && targets.every((t) => t === 'files' || t === 'commands')
  if (meta.in && (meta.in !== 'main' || !scopable)) throw new Error(`${file}: in: main is the only scope, for forbid rules on files or commands`)
  if (meta.at && (meta.at !== 'pr' || kind !== 'verify')) throw new Error(`${file}: at: pr is the only gate, for verify rules`)
  if (meta.needs && (meta.needs !== 'test-command' || kind !== 'verify')) {
    throw new Error(`${file}: needs: test-command is the only need, for verify rules`)
  }
  const flags = [...new Set(`${meta.flags ?? ''}m`.replace(/[gy]/g, ''))].join('')
  const patterns = toList(kind === 'verify' ? meta.run : meta.pattern).map((p) => new RegExp(p, flags))
  if (kind === 'verify' && (!patterns.length || !meta.when)) throw new Error(`${file}: verify rules need when and run`)
  if (!kind.startsWith('max-') && !patterns.length) throw new Error(`${file}: missing pattern`)
  return {
    id: basename(file, '.md'),
    kind,
    patterns,
    unless: meta.unless ? new RegExp(meta.unless, flags) : null,
    targets,
    paths: meta.paths ? toList(meta.paths).map(globToRegExp) : null,
    when: toList(meta.when).map(globToRegExp),
    claims: meta.claims ? new RegExp(meta.claims, flags) : null,
    needles: needlesOf(patterns, flags),
    caseless: flags.includes('i'),
    severity: meta.severity ?? 'block',
    locked: meta.locked === 'true',
    pin: meta.pin === 'true',
    main: meta.in === 'main',
    at: meta.at ?? 'stop',
    needs: meta.needs ?? null,
    max: Number(meta.max ?? (kind === 'max-open-prs' ? 5 : 300)),
    ...parseBody(match[2]),
    file,
  }
}

function targetsOf(kind, given) {
  if (kind === 'verify') return []
  if (kind.startsWith('max-')) return ['pr']
  return toList(given ?? (kind === 'require' ? 'pr' : 'files'))
}

export function parseEntry(source, file) {
  try {
    return { file, rule: parseRule(source, file) }
  } catch (error) {
    return { file, error }
  }
}

function parseFrontmatter(text) {
  const meta = {}
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^([\w-]+):\s*(.*)$/)
    if (m) meta[m[1]] = parseValue(m[2])
  }
  return meta
}

function parseValue(raw) {
  const value = raw.trim()
  if (value.startsWith('[')) return (value.slice(1, value.lastIndexOf(']')).match(LIST_ITEM) ?? []).map(parseValue).filter(Boolean)
  const single = value.match(/^'((?:[^']|'')*)'/)
  if (single) return single[1].replaceAll("''", "'")
  const double = value.match(/^"((?:[^"\\]|\\.)*)"/)
  if (double) return JSON.parse(`"${double[1]}"`)
  return value.replace(/\s+#.*$/, '')
}

function parseBody(text) {
  const sections = { text: [] }
  let name = 'text'
  let fence = null
  for (const line of text.split(/\r?\n/)) {
    const heading = !fence && line.match(/^##\s+(.+?)\s*$/)
    if (heading) {
      name = heading[1].toLowerCase()
      sections[name] = []
      continue
    }
    const marker = line.match(/^(`{3,}|~{3,})/)?.[1]
    if (marker && !fence) fence = marker
    else if (marker && line.trim() === fence) fence = null
    sections[name].push(line)
  }
  return { text: sections.text.join('\n').trim().split('\n')[0], bad: example(sections.bad), good: example(sections.good) }
}

function example(lines) {
  if (!lines) return null
  const text = lines.join('\n').trim()
  const fenced = text.match(/(?:^|\n)(`{3,}|~{3,})[^\n]*\n([\s\S]*?)\n\1[ \t]*(?:\n|$)/)
  return fenced ? fenced[2] : text
}

function needlesOf(patterns, flags) {
  if (/[uv]/.test(flags)) return null
  const found = patterns.map((re) => requiredLiterals(re.source, flags.includes('i')))
  return found.every(Boolean) ? [...new Set(found.flat())] : null
}

function requiredLiterals(source, caseless) {
  const branches = [['']]
  let depth = 0
  for (const [, atom, quantifier = ''] of source.matchAll(REGEX_TOKEN)) {
    const runs = branches.at(-1)
    const char = depth ? null : literalOf(atom, caseless)
    depth += NESTING[atom] ?? 0
    if (!depth && atom === '|') branches.push([''])
    else if (extendsRun(char, quantifier)) runs[runs.length - 1] += char
    if (endsRun(char, quantifier)) runs.push('')
  }
  const longest = branches.map((runs) => runs.reduce((a, b) => (b.length > a.length ? b : a)))
  return longest.every(isSelective) ? longest : null
}

const NESTING = { '(': 1, ')': -1 }
const extendsRun = (char, quantifier) => char != null && !/^[*?{]/.test(quantifier)
const endsRun = (char, quantifier) => char == null || quantifier !== ''
const isSelective = (run) => run.length >= 3 || /[^\x00-\x7f]/.test(run)

function literalOf(token, caseless) {
  let char = null
  if (token.length === 1 && !/[.^$|()]/.test(token)) char = token
  else if (/^\\[ux]./.test(token)) char = String.fromCharCode(parseInt(token.slice(2), 16))
  else if (token.length === 2 && token[0] === '\\') char = CONTROL_ESCAPES[token[1]] ?? (/\w/.test(token[1]) ? null : token[1])
  if (char == null || (caseless && char > '\x7f')) return null
  return caseless ? char.toLowerCase() : char
}

const toList = (value) => (value == null || value === '' ? [] : [value].flat())

export const escapeRegExp = (text) => text.replace(/[.+^${}()|[\]\\*?]/g, '\\$&')
const alternatives = (braces) => `(?:${braces.slice(1, -1).split(',').map(escapeRegExp).join('|')})`

export function globToRegExp(glob) {
  const parts = glob.split(/(\*\*\/|\*\*|\*|\?|\{[^{}]*\})/)
  const source = parts.map((part) => GLOB_PARTS[part] ?? (/^\{.*\}$/.test(part) ? alternatives(part) : escapeRegExp(part))).join('')
  return new RegExp(glob.includes('/') ? `^${source}$` : `(^|/)${source}$`)
}
