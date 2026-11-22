// CPU time of the rule-count-dependent hook stages, measured in one process so machine load matters less.
// usage: node latency-stages.mjs <ratchet clone> <git repo> <home-12> <home-150> <home-1000>
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const [ratchet, repo, ...homes] = process.argv.slice(2)
const { loadRules } = await import(join(ratchet, 'src', 'store.mjs'))
const { checkLines, checkText, checkCommand } = await import(join(ratchet, 'src', 'check.mjs'))

const files = execFileSync('git', ['ls-files', '*.ts'], { cwd: repo, encoding: 'utf8' }).split('\n').filter((f) => f && !f.includes('.d.ts')).slice(0, 40)
const source = files.flatMap((f) => readFileSync(join(repo, f), 'utf8').split('\n').map((text, i) => ({ file: f, line: i + 1, text }))).filter((l) => l.text.trim())
const lines50 = source.slice(0, 50)
const lines300 = source.slice(0, 300)
const commit = 'Add retry to the uploader\n\nRetries failed chunk uploads three times with backoff.\n\nRefs: UP-12'
const command = 'git add src/upload.ts && git commit -m "Add retry to the uploader" && git push -u origin feature'

function cpuMs(fn, repeats = 25) {
  const times = []
  for (let i = 0; i < repeats; i++) {
    const start = process.cpuUsage()
    fn()
    const used = process.cpuUsage(start)
    times.push((used.user + used.system) / 1000)
  }
  times.sort((a, b) => a - b)
  return times[Math.floor(times.length / 2)]
}

for (const home of homes) {
  process.env.RATCHET_HOME = home
  const rules = loadRules(null)
  const row = {
    rules: rules.length,
    loadRules: cpuMs(() => loadRules(null)),
    edit50: cpuMs(() => checkLines(rules, lines50, 'files')),
    diff300: cpuMs(() => checkLines(rules, lines300, 'files')),
    commitMessage: cpuMs(() => checkText(rules, commit, 'commits', 'commit')),
    command: cpuMs(() => checkCommand(rules, command)),
  }
  console.log(JSON.stringify(row))
}
