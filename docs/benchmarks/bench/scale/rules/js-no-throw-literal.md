---
kind: forbid
pattern: '\bthrow\s+[''"\x60]'
targets: [files]
paths: ['*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}']
severity: block
from: benchmark distractor (language)
---
Throw Error objects, never strings.

## Bad
~~~~
throw "invalid input"
~~~~

## Good
~~~~
throw new TypeError("invalid input")
~~~~
