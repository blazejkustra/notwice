---
kind: forbid
pattern: '(?:\bfrom\s+|\brequire\(\s*|\bimport\(\s*|^\s*import\s+)[''"]mkdirp(?:/[^''"]*)?[''"]'
targets: [files]
paths: ['*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}']
severity: block
from: benchmark distractor (dependencies)
---
Do not import mkdirp; use fs.mkdir with recursive: true.

## Bad
~~~~
import mkdirp from 'mkdirp'
~~~~

## Good
~~~~
await mkdir(dir, { recursive: true })
~~~~
