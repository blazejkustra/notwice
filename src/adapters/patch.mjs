import { resolve } from 'node:path'
import { readText } from '../core/store.mjs'

export function patchFiles(patch, cwd, locate) {
  const files = []
  let file = null
  for (const line of patch.split('\n')) {
    const path = line.match(/^\*\*\* (?:Add|Update|Delete) File: (.+)$/)?.[1] ?? line.match(/^\*\*\* Move to: (.+)$/)?.[1]
    if (path) files.push((file = { path: path.trim(), added: [], removed: new Set() }))
    else if (file && line.startsWith('+')) file.added.push(line.slice(1))
    else if (file && line.startsWith('-')) file.removed.add(line.slice(1).trim())
  }
  return files.map(({ path, added, removed }) => {
    const kept = added.filter((text) => !removed.has(text.trim()))
    return { path, added: numbered(kept, locate ? readText(resolve(cwd, path)) : null) }
  })
}

function numbered(texts, content) {
  const lines = content?.split('\n') ?? []
  let from = 0
  return texts.map((text, i) => {
    const found = lines.indexOf(text, from)
    if (found >= 0) from = found + 1
    return { line: found >= 0 ? found + 1 : i + 1, text }
  })
}
