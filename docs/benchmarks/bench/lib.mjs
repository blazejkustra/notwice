import { execFileSync, spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

export const BENCH_DIR = fileURLToPath(new URL('.', import.meta.url))
export const FAKE_BIN = join(BENCH_DIR, 'fixtures', 'bin')
export const HARNESS_FILES = ['lib.mjs', 'scenarios.mjs', 'run.mjs', 'fixtures/bin/gh']

export const sh = (cwd, cmd, ...args) => execFileSync(cmd, args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] })
export const git = (cwd, ...args) => sh(cwd, 'git', '-c', 'user.name=Dev', '-c', 'user.email=dev@example.com', ...args)
export const succeeds = (cwd, cmd, ...args) => spawnSync(cmd, args, { cwd, encoding: 'utf8' }).status === 0

export function write(dir, file, text) {
  mkdirSync(dirname(join(dir, file)), { recursive: true })
  writeFileSync(join(dir, file), text)
}

export function readJson(file, fallback) {
  if (!existsSync(file)) return fallback
  try {
    return JSON.parse(readFileSync(file, 'utf8'))
  } catch {
    return fallback
  }
}

export function parseJsonLines(text) {
  return text.split('\n').filter(Boolean).flatMap((line) => {
    try {
      return [JSON.parse(line)]
    } catch {
      return []
    }
  })
}

export const readJsonLines = (file) => (existsSync(file) ? parseJsonLines(readFileSync(file, 'utf8')) : [])

export function harnessVersion() {
  const hash = createHash('sha256')
  for (const file of HARNESS_FILES) hash.update(readFileSync(join(BENCH_DIR, file)))
  return hash.digest('hex').slice(0, 12)
}

export function wilson(k, n, z = 1.96) {
  if (!n) return [0, 1]
  const p = k / n
  const denom = 1 + (z * z) / n
  const center = (p + (z * z) / (2 * n)) / denom
  const half = (z * Math.sqrt((p * (1 - p)) / n + (z * z) / (4 * n * n))) / denom
  return [Math.max(0, center - half), Math.min(1, center + half)]
}

function logFactorial(n) {
  let sum = 0
  for (let i = 2; i <= n; i++) sum += Math.log(i)
  return sum
}

function tableProbability(a, b, c, d) {
  const n = a + b + c + d
  return Math.exp(logFactorial(a + b) + logFactorial(c + d) + logFactorial(a + c) + logFactorial(b + d) - logFactorial(n) - logFactorial(a) - logFactorial(b) - logFactorial(c) - logFactorial(d))
}

export function fisherTwoSided(k1, n1, k2, n2) {
  const observed = tableProbability(k1, n1 - k1, k2, n2 - k2)
  const total = k1 + k2
  let p = 0
  for (let a = Math.max(0, total - n2); a <= Math.min(total, n1); a++) {
    const probability = tableProbability(a, n1 - a, total - a, n2 - total + a)
    if (probability <= observed * (1 + 1e-9)) p += probability
  }
  return Math.min(1, p)
}
