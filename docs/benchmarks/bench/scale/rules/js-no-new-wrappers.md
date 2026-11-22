---
kind: forbid
pattern: '\bnew\s+(?:String|Number|Boolean)\('
targets: [files]
paths: ['*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}']
severity: block
from: benchmark distractor (language)
---
Never create primitive wrapper objects with new String, Number or Boolean.

## Bad
~~~~
const flag = new Boolean(false)
~~~~

## Good
~~~~
const flag = false
~~~~
