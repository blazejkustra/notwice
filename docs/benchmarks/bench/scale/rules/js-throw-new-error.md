---
kind: forbid
pattern: '\bthrow\s+(?:Type|Range|Syntax|Reference)?Error\('
targets: [files]
paths: ['*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}']
severity: block
from: benchmark distractor (language)
---
Use new when throwing an Error.

## Bad
~~~~
throw Error("bad state")
~~~~

## Good
~~~~
throw new Error("bad state")
~~~~
