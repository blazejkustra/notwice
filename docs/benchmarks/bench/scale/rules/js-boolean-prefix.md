---
kind: forbid
pattern: '\b(?:const|let)\s+(?:loading|visible|disabled|open)\s*=\s*(?:true|false)\b'
targets: [files]
paths: ['*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}']
severity: warn
from: benchmark distractor (naming)
---
Boolean names start with is, has, can or should.

## Bad
~~~~
let loading = false
~~~~

## Good
~~~~
let isLoading = false
~~~~
