---
kind: forbid
pattern: '(?:\bfrom\s+|\brequire\(\s*|\bimport\(\s*|^\s*import\s+)[''"]async[''"]'
targets: [files]
paths: ['*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}']
severity: block
from: benchmark distractor (dependencies)
---
async is banned in this codebase. Use async/await instead.

## Bad
~~~~
import async from 'async'
~~~~

## Good
~~~~
for (const job of jobs) await run(job)
~~~~
