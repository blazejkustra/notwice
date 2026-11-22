---
kind: forbid
pattern: '^\s*var\s+\w'
targets: [files]
paths: ['*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}']
severity: block
from: benchmark distractor (language)
---
Declare variables with const or let, never var.

## Bad
~~~~
var count = 0
~~~~

## Good
~~~~
let count = 0
~~~~
