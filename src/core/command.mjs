import { homedir } from 'node:os'
import { resolve } from 'node:path'
import { readText } from './store.mjs'

const SEPARATORS = new Set([';', '&', '|', '(', ')'])
const WRAPPERS = new Set(['command', 'env', 'exec', 'nohup', 'time'])
const GIT_OPTIONS_WITH_VALUE = new Set(['-C', '-c', '--git-dir', '--work-tree', '--namespace', '--config-env'])
const MESSAGE_FLAG = /^(-[a-zA-Z]*m|--message|--title|-t|--body|-b|--subject)$/
const COMMIT_MESSAGE_FLAG = /^(-[a-zA-Z]*m|--message)$/
const SUBSTITUTED_HEREDOC = /^\$\(\s*cat\s*<<-?\s*(['"]?)([\w.-]+)\1[^\n]*\n([\s\S]*?)\n[ \t]*\2\s*\)$/
const UNREADABLE = { unreadable: true }
const PR_TEXT = { target: 'pr', title: ['--title', '-t'], body: ['--body', '-b'], file: ['--body-file', '-F'] }
const ISSUE_TEXT = { ...PR_TEXT, target: 'comments' }
const COMMENT_TEXT = { target: 'comments', body: ['--body', '-b'], file: ['--body-file', '-F'] }
const GH_TEXT = {
  'pr create': PR_TEXT, 'pr edit': PR_TEXT, 'issue create': ISSUE_TEXT, 'issue edit': ISSUE_TEXT,
  'pr comment': COMMENT_TEXT, 'pr review': COMMENT_TEXT, 'issue comment': COMMENT_TEXT,
  'pr close': { target: 'comments', body: ['--comment', '-c'] },
  'pr merge': { ...PR_TEXT, target: 'commits', title: ['--subject', '-t'] },
}
export const VIEWABLE = new Set(['pr create', 'pr edit'])

export const expandHome = (path) => path.replace(/^~(?=\/|$)/, homedir())

function indexOrEnd(text, search, from) {
  const index = text.indexOf(search, from)
  return index < 0 ? text.length : index
}

export function parseCommand(command) {
  const segments = []
  let segment = { words: [], heredoc: null, start: 0 }
  let word = null
  let pending = []
  let i = 0
  const endWord = () => {
    if (word) segment.words.push(word)
    word = null
  }
  const endSegment = (end) => {
    endWord()
    if (segment.words.length) segments.push({ ...segment, raw: command.slice(segment.start, end) })
    segment = { words: [], heredoc: null, start: end }
  }
  while (i < command.length) {
    const ch = command[i]
    if (ch === '\n') {
      endWord()
      i = readHeredocs(command, i + 1, pending.splice(0), segment)
      endSegment(i)
    } else if (ch === ' ' || ch === '\t') {
      endWord()
      i++
    } else if (ch === '#' && !word) {
      i = indexOrEnd(command, '\n', i)
    } else if (SEPARATORS.has(ch) && !isRedirect(command, i)) {
      endSegment(i)
      i++
    } else if (command.startsWith('<<', i) && command[i + 2] !== '<') {
      endWord()
      i = readHeredocStart(command, i + 2, pending)
    } else {
      word ??= { text: '', dynamic: false }
      i = readWordPart(command, i, word)
    }
  }
  endSegment(command.length)
  return segments
}

const executedText = (segment) => segment.words.map((w) => (w.quoted || w.dynamic ? '…' : w.text)).join(' ')

export function statusText(command) {
  const segments = parseCommand(command)
  const joins = segments.some((s) => /\bpipefail\b/.test(executedText(s))) ? /^(&&|\|(?!\|))/ : /^&&/
  const chain = []
  for (const segment of segments.toReversed()) {
    const after = command.slice(segment.start + segment.raw.length).replace(/^[\s)]+/, '')
    if (chain.length ? !joins.test(after) : after) break
    chain.unshift(executedText(segment))
  }
  return chain.join(' && ')
}

const isRedirect = (command, i) => command[i] === '&' && (/[<>]/.test(command[i - 1]) || command[i + 1] === '>')

function readWordPart(command, i, word) {
  const ch = command[i]
  if (ch === "'" || ch === '"') word.quoted = true
  if (ch === "'") {
    const end = indexOrEnd(command, "'", i + 1)
    word.text += command.slice(i + 1, end)
    return end + 1
  }
  if (ch === '"') return readDoubleQuoted(command, i + 1, word)
  if (ch === '\\') {
    word.text += command[i + 1] ?? ''
    return i + 2
  }
  if (ch === '$' || ch === '`') return readExpansion(command, i, word)
  word.text += ch
  return i + 1
}

function readDoubleQuoted(command, i, word) {
  while (i < command.length && command[i] !== '"') {
    if (command[i] === '\\' && '"\\$`'.includes(command[i + 1])) {
      word.text += command[i + 1]
      i += 2
    } else if (command[i] === '$' || command[i] === '`') {
      i = readExpansion(command, i, word)
    } else {
      word.text += command[i++]
    }
  }
  return i + 1
}

function readExpansion(command, i, word) {
  const end = expansionEnd(command, i)
  word.text += command.slice(i, end)
  if (end > i + 1) word.dynamic = true
  return end
}

function expansionEnd(command, i) {
  if (command[i] === '`') return indexOrEnd(command, '`', i + 1) + 1
  if (command[i + 1] === '(') return substitutionEnd(command, i + 2)
  if (command[i + 1] === '{') return indexOrEnd(command, '}', i + 2) + 1
  return i + 1 + (command.slice(i + 1).match(/^([A-Za-z_]\w*|[0-9@*#?$!-])/)?.[0].length ?? 0)
}

function substitutionEnd(command, i) {
  const pending = []
  let depth = 1
  while (i < command.length && depth > 0) {
    const ch = command[i]
    if (ch === '\\') {
      i += 2
    } else if (ch === "'") {
      i = indexOrEnd(command, "'", i + 1) + 1
    } else if (ch === '"') {
      i = readDoubleQuoted(command, i + 1, { text: '' })
    } else if (command.startsWith('<<', i)) {
      i = readHeredocStart(command, i + 2, pending)
    } else if (ch === '\n' && pending.length) {
      i = readHeredocs(command, i + 1, pending.splice(0), {})
    } else {
      if (ch === '(') depth++
      if (ch === ')') depth--
      i++
    }
  }
  return i
}

function readHeredocStart(command, i, pending) {
  const match = command.slice(i).match(/^-?[ \t]*(['"]?)([\w.-]+)\1/)
  if (match) pending.push(match[2])
  return i + (match?.[0].length ?? 0)
}

function readHeredocs(command, i, delimiters, segment) {
  for (const delimiter of delimiters) {
    const lines = command.slice(i).split('\n')
    const end = lines.findIndex((line) => line.trim() === delimiter)
    segment.heredoc ??= (end < 0 ? lines : lines.slice(0, end)).join('\n')
    i += end < 0 ? command.length : lines.slice(0, end + 1).join('\n').length + 1
  }
  return Math.min(i, command.length)
}

function programIndex(words) {
  let index = 0
  while (index < words.length && (/^[A-Za-z_]\w*=/.test(words[index]) || WRAPPERS.has(words[index]))) index++
  return index
}

function gitSubcommand(words, start, cwd) {
  let dir = cwd
  let index = start
  while (index < words.length && words[index].startsWith('-')) {
    if (words[index] === '-C') dir = resolve(dir, expandHome(words[index + 1] ?? ''))
    index += GIT_OPTIONS_WITH_VALUE.has(words[index]) ? 2 : 1
  }
  return { index, dir }
}

const REDIRECT = /^(\d*|&)(>>?|<)(&?\d+|\|)?/

const withoutRedirects = (words) => words.filter((word, i) => !REDIRECT.test(word.text) && !/^(\d*|&)(>>?|<)$/.test(words[i - 1]?.text ?? ''))

export function readCommand(command, cwd) {
  let dir = cwd
  return parseCommand(command).map((segment, index, all) => {
    segment = { ...segment, args: withoutRedirects(segment.words) }
    const words = segment.args.map((w) => w.text)
    const start = programIndex(words)
    const program = words[start]
    const step = { ...segment, program, cwd: dir, before: all.slice(0, index), sub: null, args: segment.args.slice(start + 1) }
    if (program === 'cd') dir = resolve(dir, expandHome(words[start + 1] ?? '~'))
    if (program === 'git') {
      const found = gitSubcommand(words, start + 1, dir)
      Object.assign(step, { sub: words[found.index], cwd: found.dir, args: segment.args.slice(found.index + 1) })
    }
    if (program === 'gh') Object.assign(step, { sub: words.slice(start + 1, start + 3).join(' '), args: segment.args.slice(start + 3) })
    return step
  })
}

const PUSH_SKIPS = new Set(['--delete', '-d', '--tags', '--mirror', '--prune'])
const PUSH_OPTIONS_WITH_VALUE = new Set(['-o', '--push-option', '--repo', '--receive-pack', '--exec'])

export function pushTargets(step) {
  const words = step.args.map((w) => w.text)
  if (words.some((w) => PUSH_SKIPS.has(w))) return []
  const positional = words.filter((w, i) => !w.startsWith('-') && !PUSH_OPTIONS_WITH_VALUE.has(words[i - 1]))
  const [remote = 'origin', ...specs] = positional
  if (!specs.length) return [{ remote, src: 'HEAD', dst: null }]
  const pairs = specs.map((spec) => spec.replace(/^\+/, '').split(':'))
  return pairs.filter(([src]) => src).map(([src, dst]) => ({ remote, src, dst: dst ?? src }))
}

export const isGit = (step, sub) => step.program === 'git' && step.sub === sub
export const isPrCreate = (step) => step.program === 'gh' && step.sub === 'pr create'

function flagValues(args, isFlag) {
  const values = []
  for (const [i, word] of args.entries()) {
    const inline = word.text.match(/^(--[\w-]+)=([\s\S]*)$/)
    if (inline && isFlag(inline[1])) values.push({ ...word, text: inline[2] })
    else if (isFlag(word.text) && args[i + 1]) values.push(args[i + 1])
  }
  return values
}

export const flagValue = (step, names) => flagValues(step.args, (text) => names.includes(text))[0]?.text

function readValue(word) {
  const heredoc = word.text.match(SUBSTITUTED_HEREDOC)
  if (heredoc) return { text: heredoc[3] }
  return word.dynamic ? UNREADABLE : { text: word.text }
}

function readFile(step, word) {
  if (word.dynamic) return UNREADABLE
  if (word.text === '-') return step.heredoc != null ? { text: step.heredoc } : UNREADABLE
  const writer = step.before.findLast((segment) => segment.raw.includes(word.text))
  if (writer) return writer.heredoc != null ? { text: writer.heredoc } : UNREADABLE
  const text = readText(resolve(step.cwd, expandHome(word.text)))
  return text == null ? UNREADABLE : { text }
}

export function commitMessage(step) {
  const messages = flagValues(step.args, (text) => COMMIT_MESSAGE_FLAG.test(text)).map(readValue)
  if (messages.some((m) => m.unreadable)) return UNREADABLE
  if (messages.length) return { text: messages.map((m) => m.text).join('\n\n') }
  const [file] = flagValues(step.args, (text) => /^(-[a-zA-Z]*F|--file)$/.test(text))
  return file ? readFile(step, file) : null
}

export function ghText(step) {
  const spec = step.program === 'gh' && GH_TEXT[step.sub]
  if (!spec) return null
  const pick = (names) => (names ? flagValues(step.args, (text) => names.includes(text))[0] : undefined)
  const [titleWord, bodyWord, fileWord] = [pick(spec.title), pick(spec.body), pick(spec.file)]
  const title = titleWord && readValue(titleWord)
  const body = bodyWord ? readValue(bodyWord) : fileWord && readFile(step, fileWord)
  const missing = step.sub === 'pr create' && (!title || !body)
  return {
    target: spec.target,
    title: title?.text ?? null,
    body: body?.text ?? null,
    unreadable: Boolean(title?.unreadable || body?.unreadable || missing),
    number: step.args.find((w, i) => /^\d+$/.test(w.text) && !step.args[i - 1]?.text.startsWith('-'))?.text ?? null,
  }
}

export function guardText(step) {
  const blank = step.program === 'gh' || isGit(step, 'commit')
  const words = step.words.map((word, i) => {
    if (blank && MESSAGE_FLAG.test(step.words[i - 1]?.text ?? '')) return '…'
    return blank ? word.text.replace(/^(--(?:message|title|body|subject))=[\s\S]*$/, '$1=…') : word.text
  })
  return words.join(' ')
}
