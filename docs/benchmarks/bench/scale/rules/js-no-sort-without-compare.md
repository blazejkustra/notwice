---
kind: forbid
pattern: '\.sort\(\s*\)\s*(?:;|$)'
targets: [files]
paths: ['*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}']
severity: warn
from: benchmark distractor (language)
---
Pass a compare function to sort(); the default sorts as strings.

## Bad
~~~~
const sorted = scores.sort()
~~~~

## Good
~~~~
const sorted = scores.toSorted((a, b) => a - b)
~~~~
