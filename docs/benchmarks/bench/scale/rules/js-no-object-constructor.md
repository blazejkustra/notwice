---
kind: forbid
pattern: '\bnew\s+Object\(\s*\)'
targets: [files]
paths: ['*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}']
severity: block
from: benchmark distractor (language)
---
Use {} instead of new Object().

## Bad
~~~~
const map = new Object()
~~~~

## Good
~~~~
const map = {}
~~~~
