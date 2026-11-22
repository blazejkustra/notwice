import { execFileSync } from 'node:child_process'
import { checkLines, checkText, merge } from '../../../src/core/check.mjs'
import { parseDiff } from '../../../src/core/git.mjs'
import { loadDir } from '../../../src/core/store.mjs'

const [rulesArg, count, excludeAuthor, ...repos] = process.argv.slice(2)
const rules = rulesArg.split(',').flatMap((dir) => loadDir(dir)).filter((e) => e.rule).map((e) => e.rule)
const authorFilter = excludeAuthor === '-' ? [] : ['--perl-regexp', `--author=^(?!.*(?:${excludeAuthor}))`]

function commitsOf(repo) {
  const args = ['-C', repo, '-c', 'core.quotePath=false', 'log', '-p', '-U0', '--no-merges', '--no-color', '-n', count, ...authorFilter, '--format=%x1e%h%x00%an%x00%B%x00']
  const out = execFileSync('git', args, { encoding: 'utf8', maxBuffer: 1024 * 1024 * 1024, env: { ...process.env, GIT_OPTIONAL_LOCKS: '0' } })
  return out.split('\x1e').filter(Boolean).map((chunk) => {
    const [sha, author, message, diff] = chunk.split('\0')
    return { sha, author, message: message.trim(), lines: parseDiff(diff ?? '') }
  })
}

const report = { rules: rules.length, repos: {} }
for (const repo of repos) {
  const list = commitsOf(repo)
  const hits = list.flatMap((c) => {
    const result = merge(checkLines(rules, c.lines, 'files'), checkText(rules, c.message, 'commits', 'message'))
    return result.violations.map((v) => `${v.id} ${c.sha} ${c.author} ${v.where}: ${v.excerpt.slice(0, 140)}`)
  })
  report.repos[repo.split('/').pop()] = { commits: list.length, authors: new Set(list.map((c) => c.author)).size, addedLines: list.reduce((s, c) => s + c.lines.length, 0), hits }
}
console.log(JSON.stringify(report, null, 1))
