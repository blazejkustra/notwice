---
kind: forbid
pattern: '@ts-nocheck'
targets: [files]
paths: ['*.{ts,tsx,mts,cts}']
severity: block
from: benchmark distractor (language)
---
Never disable type checking for a whole file with @ts-nocheck.

## Bad
~~~~
// @ts-nocheck
~~~~

## Good
~~~~
// typed with the generated client
~~~~
