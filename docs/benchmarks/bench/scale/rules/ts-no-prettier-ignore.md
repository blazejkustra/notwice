---
kind: forbid
pattern: 'prettier-ignore\s*$'
targets: [files]
paths: ['*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}']
severity: block
from: benchmark distractor (language)
---
Do not use prettier-ignore without a reason.

## Bad
~~~~
// prettier-ignore
~~~~

## Good
~~~~
// prettier-ignore -- keeps the matrix aligned
~~~~
