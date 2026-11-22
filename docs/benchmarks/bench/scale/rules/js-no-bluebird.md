---
kind: forbid
pattern: '(?:\bfrom\s+|\brequire\(\s*|\bimport\(\s*|^\s*import\s+)[''"]bluebird(?:/[^''"]*)?[''"]'
targets: [files]
paths: ['*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}']
severity: block
from: benchmark distractor (dependencies)
---
Replace bluebird with native promises.

## Bad
~~~~
import bluebird from 'bluebird'
~~~~

## Good
~~~~
await Promise.all(tasks)
~~~~
