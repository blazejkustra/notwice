---
kind: forbid
pattern: '\b(?:const|let|var)\s+(?![ijk]\b)[a-zA-Z]\s*[=:]'
targets: [files]
paths: ['*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}']
severity: block
from: benchmark distractor (naming)
---
Name variables for what they hold: no single-letter names except i, j and k (ESLint id-length).

## Bad
~~~~
const v = Math.min(value, max)
~~~~

## Good
~~~~
const limited = Math.min(value, max)
~~~~
