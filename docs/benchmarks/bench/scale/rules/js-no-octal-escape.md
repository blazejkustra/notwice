---
kind: forbid
pattern: '([''"])[^''"\n]*\\[1-7][0-7]?[^''"\n]*\1'
targets: [files]
paths: ['*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}']
severity: block
from: benchmark distractor (language)
---
No octal escape sequences in strings; use \u escapes.

## Bad
~~~~
const newline = "\12"
~~~~

## Good
~~~~
const newline = "\u000a"
~~~~
