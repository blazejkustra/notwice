---
kind: forbid
pattern: '\bfs\.exists\('
targets: [files]
paths: ['*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}']
severity: block
from: benchmark distractor (language)
---
fs.exists is deprecated; use fs.access or fs.stat.

## Bad
~~~~
fs.exists(path, (ok) => {})
~~~~

## Good
~~~~
await fs.promises.access(path)
~~~~
