---
kind: forbid
pattern: '(?:\bfrom\s+|\brequire\(\s*|\bimport\(\s*|^\s*import\s+)[''"]rimraf(?:/[^''"]*)?[''"]'
targets: [files]
paths: ['*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}']
severity: block
from: benchmark distractor (dependencies)
---
Do not import rimraf; use fs.rm with recursive: true.

## Bad
~~~~
import rimraf from 'rimraf'
~~~~

## Good
~~~~
await rm(dir, { recursive: true, force: true })
~~~~
