---
kind: forbid
pattern: '\barguments\.(?:callee|caller)\b'
targets: [files]
paths: ['*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}']
severity: block
from: benchmark distractor (language)
---
Do not use arguments.callee or arguments.caller.

## Bad
~~~~
return arguments.callee(n - 1)
~~~~

## Good
~~~~
return factorial(n - 1)
~~~~
