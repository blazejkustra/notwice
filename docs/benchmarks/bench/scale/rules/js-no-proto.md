---
kind: forbid
pattern: '\.__proto__\b'
targets: [files]
paths: ['*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}']
severity: block
from: benchmark distractor (language)
---
Use Object.getPrototypeOf, never __proto__.

## Bad
~~~~
const parent = obj.__proto__
~~~~

## Good
~~~~
const parent = Object.getPrototypeOf(obj)
~~~~
