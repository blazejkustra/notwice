---
kind: forbid
pattern: ':\s*(?:Object|Function)\b(?!\.)'
targets: [files]
paths: ['*.{ts,tsx,mts,cts}']
severity: block
from: benchmark distractor (language)
---
Do not use Object or Function as types; describe the shape.

## Bad
~~~~
function run(cb: Function) {}
~~~~

## Good
~~~~
function run(cb: () => void) {}
~~~~
