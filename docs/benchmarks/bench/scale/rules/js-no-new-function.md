---
kind: forbid
pattern: '\bnew\s+Function\('
targets: [files]
paths: ['*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}']
severity: block
from: benchmark distractor (language)
---
Never build functions from strings with new Function.

## Bad
~~~~
const fn = new Function("a", "b", body)
~~~~

## Good
~~~~
const fn = (a, b) => a + b
~~~~
