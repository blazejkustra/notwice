---
kind: forbid
pattern: '\b(\w+)\s*!==?\s*\1\b(?!\.)'
targets: [files]
paths: ['*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}']
severity: block
from: benchmark distractor (language)
---
Use Number.isNaN instead of comparing a value with itself.

## Bad
~~~~
if (x !== x) return
~~~~

## Good
~~~~
if (Number.isNaN(x)) return
~~~~
