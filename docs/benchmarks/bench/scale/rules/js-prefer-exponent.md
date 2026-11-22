---
kind: forbid
pattern: '\bMath\.pow\('
targets: [files]
paths: ['*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}']
severity: block
from: benchmark distractor (language)
---
Use the ** operator instead of Math.pow.

## Bad
~~~~
const area = Math.pow(r, 2) * Math.PI
~~~~

## Good
~~~~
const area = r ** 2 * Math.PI
~~~~
