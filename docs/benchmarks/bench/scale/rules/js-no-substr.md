---
kind: forbid
pattern: '\.substr\('
targets: [files]
paths: ['*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}']
severity: block
from: benchmark distractor (language)
---
Use slice instead of the deprecated substr.

## Bad
~~~~
const year = date.substr(0, 4)
~~~~

## Good
~~~~
const year = date.slice(0, 4)
~~~~
