---
kind: forbid
pattern: 'new\s+Date\(\s*[''"]\d{1,2}/\d{1,2}/\d{2,4}[''"]'
targets: [files]
paths: ['*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}']
severity: block
from: benchmark distractor (language)
---
Never parse locale-style date strings; use ISO 8601.

## Bad
~~~~
const due = new Date("03/04/2026")
~~~~

## Good
~~~~
const due = new Date("2026-03-04T00:00:00Z")
~~~~
