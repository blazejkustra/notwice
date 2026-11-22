import { blocking, checkCommits, checkLines, checkSize, checkText, describe, merge, withoutRequire } from '../core/check.mjs'
import { baseCommit, commitsIn, git, linesNewAgainst, numstat } from '../core/git.mjs'
import { parseEntry } from '../core/rules.mjs'
import { parseJson, readText, uniqueRules } from '../core/store.mjs'

export function ciChange(root, { base: baseRef, prTitle, prBodyFile }, env = process.env) {
  const github = parseJson(readText(env.GITHUB_EVENT_PATH ?? ''), {}).pull_request
  if (github) {
    const base = git(root, 'merge-base', github.base.sha, github.head.sha)?.trim()
    const pr = { label: `PR #${github.number}`, title: github.title, body: github.body ?? '' }
    return base && { base, rulesFrom: github.base.sha, head: github.head.sha, pr }
  }
  const head = env.CI_MERGE_REQUEST_SOURCE_BRANCH_SHA || 'HEAD'
  const githubBase = env.GITHUB_BASE_REF ? `origin/${env.GITHUB_BASE_REF}` : undefined
  const base = baseCommit(root, baseRef ?? (env.CI_MERGE_REQUEST_DIFF_BASE_SHA || githubBase), head)
  return base && { base, rulesFrom: base, head, pr: givenPr(prTitle, prBodyFile, env) }
}

function givenPr(prTitle, prBodyFile, env) {
  const title = prTitle ?? env.CI_MERGE_REQUEST_TITLE
  const body = prBodyFile ? readText(prBodyFile) : env.CI_MERGE_REQUEST_DESCRIPTION
  if (title == null && body == null) return null
  const label = env.CI_MERGE_REQUEST_IID ? `MR !${env.CI_MERGE_REQUEST_IID}` : 'PR'
  const truncated = !prBodyFile && env.CI_MERGE_REQUEST_DESCRIPTION_IS_TRUNCATED === 'true'
  return { label, title: title ?? '', body: body ?? '', truncated }
}

export function scanRange(root, rules, bases, head, tree = head) {
  const lines = linesNewAgainst(root, bases.map((base) => [base, tree]))
  return merge(checkLines(rules, lines, 'files'), checkCommits(rules, commitsIn(root, head, bases)))
}

export function ciResult(root, { base, rulesFrom, head, pr }) {
  const rules = rulesAt(root, rulesFrom)
  const parts = [scanRange(root, rules, [base], head)]
  if (pr) parts.push(checkText(pr.truncated ? withoutRequire(rules) : rules, `${pr.title}\n\n${pr.body}`, 'pr', pr.label))
  if (pr) parts.push(checkSize(rules, numstat(root, base, head), pr.body))
  return { ...merge(...parts), notes: ciNotes(rules, rulesFrom, pr) }
}

function ciNotes(rules, rulesFrom, pr) {
  const source = `.notwice/rules at ${rulesFrom.slice(0, 12)}`
  const none = `no project rules in ${source}, so nothing was checked. Personal rules never run in CI: commit rule files to .notwice/rules.`
  const truncated = `${pr?.label}: GitLab passed only the first 2,700 characters of the description, so the rest and require rules went unchecked.`
  return [rules.length ? `checked ${rules.length} project rule(s) from ${source}` : none, pr?.truncated && truncated].filter(Boolean)
}

function rulesAt(root, commit) {
  const dir = `${commit}:.notwice/rules`
  const names = (git(root, 'ls-tree', '--name-only', dir) ?? '').split('\n').filter((name) => name.endsWith('.md'))
  return uniqueRules(names.map((name) => ({ ...parseEntry(git(root, 'show', `${dir}/${name}`) ?? '', name), source: 'project' })))
}

export function formatResult(result, format) {
  const failing = blocking(result)
  const notes = result.notes ?? []
  const { violations, overrides } = result
  if (format === 'json') return JSON.stringify({ blocking: failing.length, violations, overrides, notes }, null, 2)
  const github = format === 'github'
  const allowed = (o) => (github ? `::warning title=notwice ${o.id}::allowed by notwice-allow at ${o.where}` : `allowed: ${o.where} [${o.id}]`)
  return [
    ...(github ? violations.map(annotation) : []),
    ...(violations.length ? [describe(violations)] : []),
    ...overrides.map(allowed),
    ...notes.map((note) => `notwice: ${note}`),
    `notwice: ${failing.length} blocking, ${violations.length - failing.length} warning(s), ${overrides.length} allowed`,
  ].join('\n')
}

function annotation(v) {
  const level = v.severity === 'block' ? 'error' : 'warning'
  const location = v.where.match(/^(.+):(\d+)$/)
  const where = location ? `file=${location[1]},line=${location[2]},` : ''
  return `::${level} ${where}title=notwice ${v.id}::${v.text}`
}
