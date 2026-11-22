import assert from 'node:assert/strict'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { test } from 'node:test'
import { STARTER_DIR } from '../src/core/store.mjs'
import { EM_DASH, ROOT, commit, gitIn, makeHome, makeRepo, notwice, tempDir, write } from './helpers.mjs'

const DASH_RULE = `---\nid: no-dash\nkind: forbid\npattern: '${EM_DASH}'\ntargets: [files, commits, pr]\n---\nNo em dashes.\n\n## Bad\na ${EM_DASH} b\n\n## Good\na, b\n`

test('init adds the starter rules as proposals, prints one approve command, and is idempotent', () => {
  const home = tempDir()
  const starter = readdirSync(STARTER_DIR).filter((n) => n.endsWith('.md'))
  const first = notwice(['init'], { home })
  assert.equal(first.code, 0)
  assert.deepEqual(readdirSync(join(home, 'proposed')).sort(), starter.sort())
  assert.match(first.stdout, new RegExp(`notwice approve ${starter.map((n) => n.replace('.md', '')).join(' ')}`))
  notwice(['approve', starter[0].replace('.md', '')], { home })
  const second = notwice(['init'], { home })
  assert.match(second.stdout, /Added 0 starter/)
  assert.equal(readdirSync(join(home, 'proposed')).length, starter.length - 1)
})

test('approve needs a passing proof and takes several ids; retire moves active rules and proposals to retired', () => {
  const home = tempDir()
  write(home, 'proposed/weak.md', '---\nid: weak\nkind: forbid\npattern: zzz\n---\nWeak.\n\n## Bad\nnothing\n\n## Good\nfine\n')
  const refused = notwice(['approve', 'weak'], { home })
  assert.equal(refused.code, 1)
  assert.match(refused.stderr, /Bad example does not trigger it/)
  assert.ok(existsSync(join(home, 'proposed', 'weak.md')))
  write(home, 'proposed/no-dash.md', DASH_RULE)
  write(home, 'proposed/no-dash-2.md', DASH_RULE)
  assert.equal(notwice(['approve', 'no-dash', 'no-dash-2'], { home }).code, 0)
  assert.ok(existsSync(join(home, 'rules', 'no-dash.md')))
  assert.ok(existsSync(join(home, 'rules', 'no-dash-2.md')))
  assert.equal(notwice(['retire', 'no-dash', 'weak'], { home }).code, 0)
  assert.deepEqual(readdirSync(join(home, 'retired')).sort(), ['no-dash.md', 'weak.md'])
  assert.equal(notwice(['approve', 'missing'], { home }).code, 1)
  assert.equal(notwice(['approve'], { home }).code, 1)
})

test('test proves every rule and fails on a broken one', () => {
  const home = makeHome({ approve: false })
  const ok = notwice(['test'], { home })
  assert.equal(ok.code, 0)
  const count = readdirSync(join(home, 'proposed')).length + 1
  assert.match(ok.stdout, new RegExp(`${count} proven, 0 failed`))
  write(home, 'rules/bad.md', '---\nkind: forbid\npattern: x\n---\nText\n\n## Bad\ny\n\n## Good\nz\n')
  const broken = notwice(['test', 'bad'], { home })
  assert.equal(broken.code, 1)
  assert.match(broken.stdout, /Bad example does not trigger it/)
})

test('propose proves a draft and records the incident as a failure', () => {
  const home = tempDir()
  write(home, 'proposed/no-dash.md', DASH_RULE)
  const r = notwice(['propose', 'no-dash', 'Agent', 'used', 'em', 'dashes'], { home })
  assert.equal(r.code, 0)
  assert.match(r.stdout, /! notwice approve no-dash/)
  const record = JSON.parse(readFileSync(join(home, 'failures.jsonl'), 'utf8').trim())
  assert.equal(record.what_happened, 'Agent used em dashes')
  assert.equal(record.rule_or_check, 'no-dash')
  assert.match(record.evidence, new RegExp(EM_DASH))
  assert.equal(notwice(['propose', 'nothing-here'], { home }).code, 1)
})

test('list shows each location and state', () => {
  const home = makeHome({ approve: false })
  notwice(['approve', 'no-em-dash'], { home })
  const out = notwice(['list'], { home }).stdout
  assert.match(out, /personal active[\s\S]*no-em-dash/)
  assert.match(out, /personal proposed[\s\S]*pr-sections/)
})

test('stats counts fires, blocks and overrides, and names prune candidates', () => {
  const home = makeHome()
  const now = new Date().toISOString()
  const approvals = readdirSync(join(home, 'rules')).filter((n) => n.endsWith('.md') && n !== 'no-pr-assets-branch.md')
  write(home, 'log.jsonl', [
    { ts: '2026-01-01T10:00:00Z', type: 'approve', rule: 'no-pr-assets-branch' },
    ...approvals.map((name) => ({ ts: now, type: 'approve', rule: name.replace('.md', '') })),
    { ts: '2026-11-20T10:00:00Z', type: 'violation', rule: 'no-em-dash', blocked: true },
    { ts: '2026-11-21T10:00:00Z', type: 'violation', rule: 'no-em-dash', blocked: false },
    { ts: '2026-11-21T11:00:00Z', type: 'override', rule: 'no-em-dash' },
  ].map((e) => JSON.stringify(e)).join('\n') + '\n')
  const out = notwice(['stats'], { home }).stdout
  assert.match(out, /no-em-dash\s+2\s+1\s+1\s+2026-11-21/)
  assert.match(out, /prune candidates: no-pr-assets-branch\n/)
})

test('check scans the branch locally and exits 1 on a blocking violation', () => {
  const home = makeHome()
  const repo = makeRepo()
  commit(repo, { 'a.md': 'clean\n' }, 'Add a')
  assert.equal(notwice(['check'], { home, cwd: repo }).code, 0)
  write(repo, 'a.md', `clean\nnot ${EM_DASH} clean\n`)
  const r = notwice(['check'], { home, cwd: repo })
  assert.equal(r.code, 1)
  assert.match(r.stdout, /a\.md:2 \[no-em-dash\]/)
})

test('check --ci uses project rules only and checks the PR diff, commits, body and size', () => {
  const personal = makeHome()
  const repo = makeRepo()
  gitIn(repo, 'checkout', '-q', 'main')
  commit(repo, { '.notwice/rules/no-dash.md': DASH_RULE }, 'Add the no-dash rule')
  gitIn(repo, 'push', '-q', 'origin', 'main')
  gitIn(repo, 'checkout', '-q', 'feature')
  gitIn(repo, 'merge', '-q', 'main')
  commit(repo, { 'docs.md': `Fast ${EM_DASH} simple\n`, 'big.ts': 'x\n'.repeat(500) }, `Add docs\n\nCo-Authored-By: Claude <noreply@anthropic.com>`)
  gitIn(repo, 'push', '-q', '-u', 'origin', 'feature')
  const event = {
    pull_request: {
      number: 9,
      title: 'Add docs',
      body: `Body ${EM_DASH} here`,
      base: { sha: gitIn(repo, 'rev-parse', 'origin/main').trim() },
      head: { sha: gitIn(repo, 'rev-parse', 'HEAD').trim() },
    },
  }
  const eventPath = write(tempDir(), 'event.json', JSON.stringify(event))
  const env = { GITHUB_EVENT_PATH: eventPath, GITHUB_BASE_REF: 'main', GITHUB_ACTIONS: 'true' }
  const r = notwice(['check', '--ci'], { home: personal, cwd: repo, env })
  assert.equal(r.code, 1)
  assert.match(r.stdout, /::error file=docs\.md,line=1,title=notwice no-dash::/)
  assert.match(r.stdout, /PR #9:3 \[no-dash\]/)
  assert.doesNotMatch(r.stdout, /no-claude-attribution|max-pr-size/)
  gitIn(repo, 'checkout', '-q', 'main')
  commit(repo, { '.notwice/rules/max-pr-size.md': readFileSync(join(ROOT, 'starter/max-pr-size.md'), 'utf8') }, 'Add the size rule')
  event.pull_request.base.sha = gitIn(repo, 'rev-parse', 'HEAD').trim()
  gitIn(repo, 'checkout', '-q', 'feature')
  const sizeEnv = { ...env, GITHUB_EVENT_PATH: write(tempDir(), 'event.json', JSON.stringify(event)) }
  assert.match(notwice(['check', '--ci'], { home: personal, cwd: repo, env: sizeEnv }).stdout, /501 added lines \(limit 300\)/)
})

test('--help or -h on any subcommand prints the usage and changes nothing', () => {
  const home = tempDir()
  const repo = makeRepo()
  const globalConfig = write(tempDir(), 'gitconfig', '')
  const env = { GIT_CONFIG_GLOBAL: globalConfig }
  const commands = [
    [], ['init'], ['list'], ['test'], ['propose', 'x'], ['approve', 'x'], ['retire', 'x'], ['check'], ['check', '--ci'], ['stats'], ['memory'],
    ['agents'], ['hook'], ['git-hook', 'pre-commit'], ['install-git-hooks'], ['install-git-hooks', '--global'], ['uninstall-git-hooks'],
  ]
  for (const args of commands) {
    for (const help of ['--help', '-h']) {
      const r = notwice([...args, help], { home, cwd: repo, env })
      assert.equal(r.code, 0, `${args.join(' ')} ${help}: ${r.stderr}`)
      assert.match(r.stdout, /^notwice turns corrections into rules/, args.join(' '))
    }
  }
  assert.deepEqual(readdirSync(home), [])
  assert.equal(readFileSync(globalConfig, 'utf8'), '')
  assert.equal(gitIn(repo, 'config', '--local', '--list').includes('hook.notwice'), false)
  assert.equal(notwice(['bogus'], { home }).code, 1)
})

test('list shows each rule\'s whole text and the built-in rules', () => {
  const home = makeHome()
  const out = notwice(['list'], { home }).stdout
  assert.match(out, /built-in active/)
  assert.match(out, /human-approval .* in a terminal\.$/m)
  assert.match(out, /no-claude-attribution .* claude\.ai session links\.$/m)
})
