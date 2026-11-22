---
kind: forbid
pattern: '([''"])[^''"\n]*\\$'
targets: [files]
paths: ['*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}']
severity: block
from: benchmark distractor (language)
---
No multiline strings with a trailing backslash; use template literals.

## Bad
~~~~
const sql = "SELECT id \
~~~~

## Good
~~~~
const sql = `SELECT id`
~~~~
