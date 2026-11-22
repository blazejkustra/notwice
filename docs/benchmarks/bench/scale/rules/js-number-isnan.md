---
kind: forbid
pattern: '(?<![\w.$])is(?:NaN|Finite)\('
targets: [files]
paths: ['*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}']
severity: block
from: benchmark distractor (language)
---
Use Number.isNaN and Number.isFinite, never the global isNaN or isFinite.

## Bad
~~~~
if (isNaN(value)) return min
~~~~

## Good
~~~~
if (Number.isNaN(value)) return min
~~~~
