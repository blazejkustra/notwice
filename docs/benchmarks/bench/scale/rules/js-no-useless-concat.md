---
kind: forbid
pattern: '([''"])[^''"\n]*\1\s*\+\s*([''"])[^''"\n]*\2'
targets: [files]
paths: ['*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}']
severity: block
from: benchmark distractor (language)
---
Do not concatenate two string literals; write one string.

## Bad
~~~~
const label = "Total" + ": "
~~~~

## Good
~~~~
const label = "Total: "
~~~~
