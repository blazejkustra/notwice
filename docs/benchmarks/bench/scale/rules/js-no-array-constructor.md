---
kind: forbid
pattern: '\bnew\s+Array\(\s*\)|\bnew\s+Array\(\s*\w+\s*,'
targets: [files]
paths: ['*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}']
severity: block
from: benchmark distractor (language)
---
Use array literals instead of the Array constructor.

## Bad
~~~~
const list = new Array()
~~~~

## Good
~~~~
const list = []
~~~~
