import { existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { parseJson, readNames, readText } from './store.mjs'

const NPM_PLACEHOLDER = /no test specified/
const LOCKFILES = [['pnpm-lock.yaml', 'pnpm'], ['yarn.lock', 'yarn'], ['bun.lockb', 'bun'], ['bun.lock', 'bun']]
const FIXED = [
  ['Cargo.toml', 'cargo test'], ['go.mod', 'go test ./...'], ['Package.swift', 'swift test'],
  ['pyproject.toml', 'python -m pytest'], ['setup.py', 'python -m pytest'], ['setup.cfg', 'python -m pytest'],
  ['pytest.ini', 'python -m pytest'], ['tox.ini', 'python -m pytest'],
  ['gradlew', './gradlew test'], ['build.gradle', 'gradle test'], ['build.gradle.kts', 'gradle test'],
]

export function testCommand(root, file = '') {
  for (const dir of dirsUpTo(root, dirname(join(root, file)))) {
    const command = commandIn(dir, readNames(dir))
    if (command) return command
  }
  return null
}

function dirsUpTo(root, dir) {
  if (dir === root || !dir.startsWith(`${root}/`)) return [root]
  return [dir, ...dirsUpTo(root, dirname(dir))]
}

function commandIn(dir, names) {
  const fromPackage = names.includes('package.json') && packageCommand(dir)
  const fixed = FIXED.find(([name]) => names.includes(name))?.[1]
  const xcode = names.find((name) => /\.xc(?:odeproj|workspace)$/.test(name))
  return fromPackage || fixed || (xcode ? `xcodebuild test -scheme ${xcode.replace(/\.\w+$/, '')}` : null)
}

function packageCommand(dir) {
  const scripts = parseJson(readText(join(dir, 'package.json')), {}).scripts ?? {}
  const runner = LOCKFILES.find(([lock]) => existsSync(join(dir, lock)))?.[1] ?? 'npm'
  if (scripts.test && !NPM_PLACEHOLDER.test(scripts.test)) return `${runner} test`
  const script = ['typecheck', 'lint'].find((name) => scripts[name])
  return script ? `${runner} run ${script}` : null
}
