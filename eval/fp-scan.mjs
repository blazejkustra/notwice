import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { checkLines, checkText, merge } from '../src/core/check.mjs'
import { parseDiff } from '../src/core/git.mjs'
import { loadDir } from '../src/core/store.mjs'

const [count, ...rest] = process.argv.slice(2)
const authorIndex = rest.indexOf('--author')
const author = authorIndex >= 0 ? rest.splice(authorIndex, 2)[1] : null
const repos = rest
const SAMPLES = 15
const rules = ['../starter', '../test/fixtures/rules'].flatMap((dir) => loadDir(fileURLToPath(new URL(dir, import.meta.url)))).map((e) => e.rule)
const report = {}

function commitsOf(repo) {
  const out = execFileSync('git', ['-C', repo, '-c', 'core.quotePath=false', 'log', '-p', '-U0', '--no-merges', '--no-color', '-n', count, ...(author ? [`--author=${author}`] : []), '--format=%x1e%h%x00%an%x00%B%x00'], {
    encoding: 'utf8',
    maxBuffer: 1024 * 1024 * 1024,
  })
  return out.split('\x1e').filter(Boolean).map((chunk) => {
    const [sha, author, message, diff] = chunk.split('\0')
    return { sha, author, message: message.trim(), lines: parseDiff(diff ?? '') }
  })
}

for (const repo of repos) {
  const name = repo.split('/').pop()
  const list = commitsOf(repo)
  const added = list.reduce((sum, c) => sum + c.lines.length, 0)
  const hits = list.flatMap((c) => {
    const result = merge(checkLines(rules, c.lines, 'files'), checkText(rules, c.message, 'commits', 'message'))
    return result.violations.map((v) => ({ ...v, sha: c.sha, author: c.author }))
  })
  report[name] = { commits: list.length, addedLines: added, fires: {} }
  for (const hit of hits) {
    const entry = (report[name].fires[hit.id] ??= { count: 0, authors: {}, hits: [] })
    entry.count++
    entry.authors[hit.author] = (entry.authors[hit.author] ?? 0) + 1
    entry.hits.push(`${hit.sha} ${hit.author} ${hit.where}: ${hit.excerpt.slice(0, 160)}`)
  }
  for (const entry of Object.values(report[name].fires)) {
    const step = Math.max(1, Math.floor(entry.hits.length / SAMPLES))
    entry.samples = entry.hits.filter((_, i) => i % step === 0).slice(0, SAMPLES)
    delete entry.hits
  }
}
console.log(JSON.stringify(report, null, 2))
