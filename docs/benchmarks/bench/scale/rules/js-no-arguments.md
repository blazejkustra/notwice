---
kind: forbid
pattern: '(?<![\w.])arguments\[\d'
targets: [files]
paths: ['*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}']
severity: block
from: benchmark distractor (language)
---
Use rest parameters instead of arguments.

## Bad
~~~~
const first = arguments[0]
~~~~

## Good
~~~~
const [first] = args
~~~~
