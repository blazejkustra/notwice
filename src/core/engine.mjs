import { existsSync, realpathSync } from 'node:fs'
import { basename, dirname, join, relative, resolve, sep } from 'node:path'
import { parentSession, track, trackTurn } from './agents.mjs'
import {
  blocking, checkCommand, checkCommits, checkLines, checkOpenPrs, checkSize, checkText, checkVerify, describe, isCheckRun, logResult, merge,
  problem, warnings, withoutRequire,
} from './check.mjs'
import { VIEWABLE, commitMessage, flagValue, ghText, guardText, isGit, isPrCreate, pushTargets, readCommand, statusText } from './command.mjs'
import { fileContext, sessionContext } from './context.mjs'
import { testCommand } from './manifest.mjs'
import { baseCommit, commitsIn, defaultRef, git, linesNewAgainst, numstat, repoName, repoRoot, revParse, run, worktreeTree } from './git.mjs'
import {
  DAY_MS, appendEvent, attempt, home, loadRules, locations, log, parseJson, prune, readEvents, readNames, readSnapshot, recordFailure,
  rulesChanged, writeSnapshot,
} from './store.mjs'

const BLOCKS_AS = { 'shell.before': 'deny', 'edit.before': 'deny', 'read.before': 'deny', 'turn.end': 'continue' }
const HANDLERS = {
  'session.start': sessionStart, 'subagent.start': subagentStart, 'subagent.stop': subagentStop,
  'edit.before': beforeEdit, 'edit.after': afterEdit, 'read.before': beforeRead,
  'shell.before': beforeShell, 'shell.after': afterShell, 'tool.after': afterTool, 'turn.end': turnEnd,
}

export function handle(event) {
  track(event)
  return HANDLERS[event.type]?.(event) ?? null
}

function takeSnapshot(event, root) {
  const snapshot = { head: revParse(root, 'HEAD'), tree: worktreeTree(root), at: Date.now() }
  writeSnapshot(event.session, root, snapshot)
  return snapshot
}

const snapshotOf = (event, root) => readSnapshot(event.session, root) ?? takeSnapshot(event, root)

function sessionCommits(root, snapshot, { ref, base, published }) {
  return commitsIn(root, ref, [base, snapshot.head, published], Math.floor(snapshot.at / 1000))
}

function sessionLines(root, snapshot, base, tree) {
  if (!snapshot.tree || !tree) return []
  return linesNewAgainst(root, [[snapshot.tree, tree], [base, tree]])
}

function sessionScan(root, rules, snapshot, range, lines = sessionLines(root, snapshot, range.base, range.tree)) {
  return merge(checkLines(rules, lines, 'files'), checkCommits(rules, sessionCommits(root, snapshot, range)))
}

const headRange = (root, tree) => ({ tree, ref: 'HEAD', base: baseCommit(root) ?? 'HEAD', published: revParse(root, '@{upstream}') })

function sessionStart(event) {
  const root = repoRoot(event.cwd)
  prune('sessions', 7 * DAY_MS)
  prune('agents', 60 * DAY_MS)
  if (root) snapshotOf(event, root)
  const waiting = locations(root).flatMap((location) => readNames(join(location.dir, 'proposed'), '.md')).length
  const notices = [
    !existsSync(join(home(), 'rules')) && 'notwice: no rules yet. Run ! notwice init to add the starter set.',
    rulesChanged() && `notwice: active rules in ${join(home(), 'rules')} changed outside the notwice CLI since the last approve or retire. `
      + 'Check them with: notwice list',
    waiting && `notwice: ${waiting} proposed rule(s) wait for your approval. Run: notwice list`,
  ].filter(Boolean)
  return { ...showRules(event, sessionContext(root, loadRules(root)), { start: true }), message: notices.join('\n') }
}

function subagentStart(event) {
  if (!event.sub?.type) return null
  const root = repoRoot(event.cwd)
  return showRules(event, sessionContext(root, loadRules(root).filter((r) => !r.main)), { start: true })
}

function fileRules(event, paths) {
  const root = paths.length ? repoRoot(nearestDir(dirname(paths[0]))) : null
  if (!root) return null
  const rules = loadRules(root).filter((r) => isMain(event) || !r.main)
  const mine = readEvents(event.session).filter((e) => e.shown && e.by === event.sub?.id)
  const sinceStart = mine.slice(Math.max(0, mine.findLastIndex((e) => e.start)))
  return showRules(event, fileContext(rules, paths.map((path) => relative(root, path)), new Set(sinceStart.flatMap((e) => e.shown))))
}

function showRules(event, chosen, marker = {}) {
  if (!chosen) return null
  appendEvent(event.session, { shown: chosen.ids, by: event.sub?.id, ...marker })
  return { action: 'context', context: chosen.text }
}

function fullPath(cwd, given) {
  const path = resolve(cwd, given)
  return join(realPath(dirname(path)), basename(path))
}

const editedFiles = (event) => event.edit.files.filter((f) => f.path).map((f) => ({ ...f, path: fullPath(event.cwd, f.path) }))
const isActiveRulesDir = (dir) => dir === realPath(join(home(), 'rules')) || dir.endsWith(`${sep}.notwice${sep}rules`)

function beforeEdit(event) {
  const files = editedFiles(event)
  const guarded = files.find((f) => isActiveRulesDir(dirname(f.path)))
  if (!guarded) return (isMain(event) && mainSessionEdit(event, files)) || fileRules(event, files.map((f) => f.path))
  const entry = { type: 'violation', rule: 'human-approval', severity: 'block', blocked: true, where: 'edit', at: guarded.path }
  log({ ...entry, session: event.session, agent: event.sub?.id })
  const proposed = join(home(), 'proposed')
  return block(event, `notwice: active rules are off-limits to the agent, so ${guarded.path} stays as it is. `
    + `Write a proposal to ${proposed} instead and ask the user to approve it.`)
}

function isMain(event) {
  const delegated = /^thread:delegated-task:/.test(process.env.T3CODE_THREAD_ID ?? '')
  return event.caps?.mainVsWorker !== false && !event.worker && !delegated && !parentSession(event)
}

function mainSessionEdit(event, files) {
  const results = files.map(({ path, added }) => {
    const root = repoRoot(nearestDir(dirname(path)))
    const rules = root ? loadRules(root).filter((r) => r.main) : []
    return rules.length ? checkLines(rules, added.map((l) => ({ file: relative(root, path), ...l })), 'files', true) : merge()
  })
  return report(merge(...results), event, { where: 'edit', lead: 'notwice blocked this edit:' })
}

function beforeRead(event) {
  if (/\.p8$/i.test(event.path ?? '')) {
    return block(event, `notwice: ${event.path} is a private key. Never read or print a .p8 file; pass its path to the tool that needs it.`)
  }
  return event.path ? fileRules(event, [fullPath(event.cwd, event.path)]) : null
}

function afterEdit(event) {
  const lead = 'notwice: this edit adds lines that break a rule. Fix them now:'
  return report(merge(...editedFiles(event).map((f) => checkEdit(event, f))), event, { where: 'edit', lead })
}

function checkEdit(event, { path, added }) {
  const root = !path.startsWith(`${realPath(home())}${sep}`) && repoRoot(dirname(path))
  if (!root || git(root, 'check-ignore', '-q', path) !== null) return merge()
  const file = relative(root, path)
  const rules = loadRules(root)
  if (hasVerify(rules)) appendEvent(event.session, { at: Date.now(), root, edit: file })
  return checkLines(rules, added.map((l) => ({ file, ...l })), 'files')
}

function realPath(path) {
  const real = attempt(() => realpathSync(path))
  if (real) return real
  return path === dirname(path) ? path : join(realPath(dirname(path)), basename(path))
}

const nearestDir = (dir) => (existsSync(dir) ? dir : nearestDir(dirname(dir)))

function repoCache() {
  const cache = new Map()
  return (cwd) => {
    if (!cache.has(cwd)) {
      const root = repoRoot(cwd)
      cache.set(cwd, { root, rules: loadRules(root) })
    }
    return cache.get(cwd)
  }
}

const sendsBranch = (step) => isGit(step, 'push') || isPrCreate(step)

function beforeShell(event) {
  const { command } = event.shell
  const steps = readCommand(command, event.cwd)
  const repoOf = repoCache()
  const results = steps.map((step, index) => checkStep(step, repoOf(step.cwd), { command, event, later: steps.slice(index + 1) }))
  return report(merge(...results), event, { where: 'command', lead: 'notwice blocked this command. Fix these first, then run it again:' })
}

function checkStep(step, { root, rules }, { command, event, later }) {
  const parts = [checkCommand(rules, withHomeNamed(guardText(step)), command, isMain(event))]
  const message = isGit(step, 'commit') ? commitMessage(step) : null
  if (message?.text != null) parts.push(checkText(rules, message.text, 'commits', 'commit message'))
  if (message?.unreadable && later.some(sendsBranch)) parts.push(problem(UNREADABLE_COMMIT, 'command', step.raw.trim()))
  const text = ghText(step)
  if (text) parts.push(checkGhText(rules, text, `gh ${step.sub}`))
  if (root && sendsBranch(step)) parts.push(outgoing(root, rules, event, step))
  return merge(...parts)
}

const UNREADABLE_COMMIT = 'notwice cannot read this commit message before it runs. Run the commit and the push as separate commands.'

function checkGhText(rules, { target, title, body }, label) {
  const text = [title, body].filter((t) => t != null).join('\n\n')
  if (!text) return merge()
  return checkText(body != null && target === 'pr' ? rules : withoutRequire(rules), text, target, label)
}

const withHomeNamed = (command) => [realPath(home()), home()].reduce((text, dir) => text.replaceAll(dir, '~/.notwice'), command)

function outgoing(root, rules, event, step) {
  if (isPrCreate(step)) return prCreateGate(root, rules, event, step)
  return merge(...pushTargets(step).map((target) => pushGate(root, rules, event, target)))
}

function prCreateGate(root, rules, event, step) {
  const baseBranch = flagValue(step, ['--base', '-B'])
  const base = baseCommit(root, baseBranch ? remoteOrLocal(root, baseBranch) : defaultRef(root))
  if (!base) return problem(`cannot resolve base ${baseBranch}`, 'command', step.raw.trim())
  const head = revParse(root, 'HEAD')
  if (!head) return merge()
  const range = { tree: head, ref: head, base, published: revParse(root, '@{upstream}') }
  const snapshot = snapshotOf(event, root)
  const lines = sessionLines(root, snapshot, base, head)
  return merge(
    sessionScan(root, rules, snapshot, range, lines),
    verifyScan(event, root, rules.filter((r) => r.at === 'pr'), lines, step.raw),
    sizeCheck(root, rules, base, head, step.raw),
    openPrCheck(root, rules, step.raw),
  )
}

function openPrCheck(root, rules, allowText) {
  if (!rules.some((r) => r.kind === 'max-open-prs')) return merge()
  const open = parseJson(run('gh', ['pr', 'list', '--author', '@me', '--state', 'open', '--json', 'number', '--limit', '100'], root), null)
  return Array.isArray(open) ? checkOpenPrs(rules, open.map((pr) => pr.number), allowText) : merge()
}

function pushGate(root, rules, event, { remote, src, dst }) {
  const sha = revParse(root, `${src}^{commit}`)
  if (!sha) return merge()
  const named = dst && dst !== 'HEAD' ? dst : git(root, 'symbolic-ref', '--short', '-q', 'HEAD')?.trim()
  const branch = named?.replace(/^refs\/heads\//, '')
  const published = branch ? revParse(root, `refs/remotes/${remote}/${branch}`) : null
  const range = { tree: sha, ref: sha, base: baseCommit(root, defaultRef(root), sha) ?? 'HEAD', published }
  return merge(sessionScan(root, rules, snapshotOf(event, root), range), pushSize(root, rules, branch, sha, published))
}

const hasSizeRule = (rules) => rules.some((r) => r.kind === 'max-added-lines')

const sizeCheck = (root, rules, base, head, allowText) => (hasSizeRule(rules) ? checkSize(rules, numstat(root, base, head), allowText) : merge())

function pushSize(root, rules, branch, sha, published) {
  const pr = branch && hasSizeRule(rules) && parseJson(run('gh', ['pr', 'view', branch, '--json', 'number,body,baseRefName'], root), null)
  if (!pr) return merge()
  const base = baseCommit(root, pr.baseRefName ? remoteOrLocal(root, pr.baseRefName) : defaultRef(root), sha) ?? 'HEAD'
  const overBefore = published && blocking(sizeCheck(root, rules, base, published)).length
  return overBefore ? merge() : sizeCheck(root, rules, base, sha, pr.body ?? '')
}

const remoteOrLocal = (root, branch) => (revParse(root, `origin/${branch}`) ? `origin/${branch}` : branch)

const hasVerify = (rules) => rules.some((r) => r.kind === 'verify')

function recordRun(event, text, rules) {
  if (text && isCheckRun(rules, text)) appendEvent(event.session, { at: Date.now(), run: text })
}

function afterTool(event) {
  const { name, ok, spawn } = event.tool
  if (!name) return null
  const rules = loadRules(repoRoot(event.cwd))
  if (ok) recordRun(event, name, rules)
  if (spawn?.bg && isCheckRun(rules, name)) appendEvent(event.session, { at: Date.now(), spawn: spawn.id, label: name })
  return null
}

function subagentStop(event) {
  const spawn = readEvents(event.session).find((e) => e.spawn === event.sub?.id)
  if (spawn) appendEvent(event.session, { at: Date.now(), run: spawn.label })
  return null
}

function afterShell(event) {
  const { command, background, exit } = event.shell
  const repoOf = repoCache()
  if (exit === 0 && !background) recordRun(event, statusText(command), repoOf(event.cwd).rules)
  const checked = readCommand(command, event.cwd).map((step) => afterStep(step, repoOf(step.cwd), event)).filter(Boolean)
  const hints = [...new Set(checked.map((c) => c.hint))].join(' ')
  return report(merge(...checked.map((c) => c.result)), event, { where: 'after-command', lead: `notwice: the result breaks a rule. ${hints}` })
}

const AMEND_HINT = 'Fix the message with git commit --amend before pushing.'

function afterStep(step, { root, rules }, event) {
  if (!root) return null
  if (isGit(step, 'commit')) {
    const [last] = sessionCommits(root, snapshotOf(event, root), headRange(root))
    if (!last) return null
    return { result: checkText(rules, last.message, 'commits', `commit ${last.sha}`), hint: AMEND_HINT }
  }
  const text = ghText(step)
  return text?.unreadable && VIEWABLE.has(step.sub) ? viewedText(text, root, rules, event) : null
}

function viewedText(text, root, rules, event) {
  const number = text.number ?? event.shell.output?.match(/\/pull\/(\d+)/)?.[1]
  const pr = parseJson(run('gh', ['pr', 'view', ...(number ? [number] : []), '--json', 'number,title,body'], root), null)
  if (!pr) return null
  const result = checkGhText(rules, { target: 'pr', title: pr.title, body: pr.body ?? '' }, `PR #${pr.number}`)
  return { result, hint: `Fix it with gh pr edit ${pr.number}.` }
}

function turnEnd(event) {
  const root = repoRoot(event.cwd)
  const rules = loadRules(root)
  checkReply(event, root, rules)
  const result = root ? stopScan(event, root, rules) : merge()
  trackTurn(event, hasVerify(rules) ? result.violations.filter((v) => v.where === 'verify').map((v) => v.id) : undefined)
  const failing = blocking(result)
  if (!failing.length) return null
  if (event.turn.retry) {
    recordViolations(root, 'notwice stop hook', 'The turn ended with unresolved violations or unverified changes after a stop block.', failing)
    for (const v of failing.filter((f) => f.where === 'verify')) appendEvent(event.session, { at: Date.now(), waived: v.id })
    return null
  }
  return report(result, event, { where: 'stop', lead: 'notwice: this session still breaks these rules. Fix them before you finish:' })
}

function stopScan(event, root, rules) {
  const snapshot = snapshotOf(event, root)
  const range = headRange(root, worktreeTree(root))
  const lines = sessionLines(root, snapshot, range.base, range.tree)
  return merge(sessionScan(root, rules, snapshot, range, lines), verifyScan(event, root, rules.filter((r) => r.at !== 'pr'), lines))
}

function verifyScan(event, root, rules, lines, allowText) {
  if (!hasVerify(rules)) return merge()
  const events = readEvents(event.session).filter((e) => e.edit == null || e.root === root)
  const logged = new Set(events.map((e) => e.edit))
  const shellEdits = [...new Set(lines.map((l) => l.file))].filter((file) => !logged.has(file)).map((edit) => ({ edit }))
  const all = [...shellEdits, ...events]
  return checkVerify(withTestCommand(root, rules, all), all, event.turn?.reply ?? '', allowText)
}

function withTestCommand(root, rules, events) {
  if (!rules.some((r) => r.needs)) return rules
  const command = testCommand(root, events.findLast((e) => e.edit != null)?.edit)
  return rules.flatMap((r) => (!r.needs ? [r] : command ? [{ ...r, suggest: command }] : []))
}

const QUOTED = /```[\s\S]*?```|`[^`\n]*`|"[^"\n]*"|“[^”\n]*”/g

function checkReply(event, root, rules) {
  const { reply } = event.turn
  const result = reply ? checkText(withoutRequire(rules), reply.replace(QUOTED, '…'), 'comments', 'reply') : merge()
  if (!result.violations.length) return
  logResult(result, 'reply', event, false)
  recordViolations(root, 'chat reply', 'A reply to the user broke a rule (replies are logged, never blocked).', result.violations)
}

function recordViolations(root, source, what, violations) {
  recordFailure({
    repo: root ? repoName(root) : '',
    source,
    what_happened: what,
    evidence: describe(violations).slice(0, 1000),
    rule_or_check: [...new Set(violations.map((v) => v.id))].join(', '),
  })
}

function report(result, event, { where, lead }) {
  const decision = decide(result, event, lead)
  logResult(result, where, event)
  return decision
}

function decide(result, event, lead) {
  const failing = blocking(result)
  if (failing.length) return block(event, `${lead}\n${describe(failing)}\n${keepHint(failing)}`)
  const notes = warnings(result)
  if (!notes.length || event.type === 'turn.end') return null
  return { action: 'context', context: `notwice warnings (not blocking, fix if you agree):\n${describe(notes)}` }
}

function keepHint(failing) {
  const ids = [...new Set(failing.filter((v) => !v.locked).map((v) => `"notwice-allow ${v.id}"`))]
  const keep = ids.length ? ` Only the user may keep one as it is, by adding ${ids.join(' or ')}; never add that marker yourself.` : ''
  return `Fix or reword each one, then continue the task in this same turn.${keep}`
}

const block = (event, message) => ({ action: BLOCKS_AS[event.type] ?? 'feedback', message })
