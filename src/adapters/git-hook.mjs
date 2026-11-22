import { blocking, checkLines, checkText, describe, logResult, merge, warnings } from '../core/check.mjs'
import { baseCommit, defaultRef, git, linesNewAgainst, revParse } from '../core/git.mjs'
import { loadRules, readText } from '../core/store.mjs'
import { scanRange } from './ci.mjs'

const EVENTS = ['pre-commit', 'commit-msg', 'pre-push']
const MIN_GIT = [2, 54]
const ZERO = /^0+$/
const SCISSORS = '------------------------ >8 ------------------------'

const CHECKS = {
  'pre-commit': (root, rules) => checkLines(rules, linesNewAgainst(root, stagedDiffs(root)), 'files'),
  'commit-msg': (root, rules, [file]) => checkText(rules, cleanMessage(root, readText(file) ?? ''), 'commits', 'commit message'),
  'pre-push': (root, rules, args, stdin) => merge(...pushedRanges(root, stdin).map(({ bases, sha }) => scanRange(root, rules, bases, sha))),
}

export function runGitHook(root, event, args, stdin) {
  const check = CHECKS[event]
  if (!root || !check) return 0
  const result = check(root, loadRules(root), args, stdin)
  logResult(result, `git ${event}`)
  const failing = blocking(result)
  const notes = warnings(result)
  if (notes.length) console.error(`notwice warnings (not blocking):\n${describe(notes)}`)
  if (!failing.length) return 0
  const ids = [...new Set(failing.filter((v) => !v.locked).map((v) => `notwice-allow ${v.id}`))]
  const keep = ids.length ? ` To keep one as it is, add "${ids.join('" or "')}" to the line or message.` : ''
  console.error(`notwice blocked this ${event === 'pre-push' ? 'push' : 'commit'}:\n${describe(failing)}\nFix each one.${keep}`)
  return 1
}

function cleanMessage(root, text) {
  const comment = commentPrefix(root)
  const lines = text.split('\n')
  const cut = lines.indexOf(`${comment} ${SCISSORS}`)
  return lines.slice(0, cut < 0 ? lines.length : cut).filter((line) => !line.startsWith(comment)).join('\n')
}

function commentPrefix(root) {
  const configured = git(root, 'config', 'core.commentString')?.trim() || git(root, 'config', 'core.commentChar')?.trim()
  return configured && configured !== 'auto' ? configured : '#'
}

function stagedDiffs(root) {
  const merging = revParse(root, 'MERGE_HEAD')
  return merging ? [['--cached'], ['--cached', merging]] : [['--cached']]
}

function pushedRanges(root, stdin) {
  const lines = stdin.split('\n').map((line) => line.trim().split(/\s+/)).filter((parts) => parts.length === 4)
  const sent = lines.filter(([, sha, remoteRef]) => !ZERO.test(sha) && !remoteRef.startsWith('refs/tags/'))
  return sent.map(([localRef, sha, , remoteSha]) => {
    const base = baseCommit(root, defaultRef(root), sha) ?? sha
    return { sha, bases: [base, publishedTip(root, localRef, remoteSha)].filter(Boolean) }
  })
}

function publishedTip(root, localRef, remoteSha) {
  const known = !ZERO.test(remoteSha) && revParse(root, `${remoteSha}^{commit}`)
  return known || revParse(root, `${localRef.replace(/^refs\/heads\//, '')}@{upstream}`)
}

export function setGitHooks(cwd, { install, global, bin }) {
  const version = (git(cwd, '--version') ?? '').match(/(\d+)\.(\d+)/)?.slice(1).map(Number) ?? [0, 0]
  if (install && (version[0] < MIN_GIT[0] || (version[0] === MIN_GIT[0] && version[1] < MIN_GIT[1]))) {
    return `config-based hooks need Git ${MIN_GIT.join('.')} or later (found ${version.join('.')})`
  }
  const scope = global ? '--global' : '--local'
  for (const event of EVENTS) {
    const section = `hook.notwice-${event}`
    git(cwd, 'config', scope, '--remove-section', section)
    if (install) {
      git(cwd, 'config', scope, `${section}.command`, hookCommand(bin, event, scope))
      git(cwd, 'config', scope, `${section}.event`, event)
    }
  }
  return null
}

const shellQuote = (text) => `'${text.replaceAll("'", "'\\''")}'`

function hookCommand(bin, event, scope) {
  const missing = `notwice: ${bin} is missing, so the ${event} check was skipped. `
    + `Remove it with: git config ${scope} --remove-section hook.notwice-${event}`
  return `[ -x ${shellQuote(bin)} ] || { echo ${shellQuote(missing)} >&2; exit 0; }; ${shellQuote(bin)} git-hook ${event}`
}
