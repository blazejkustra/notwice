---
kind: forbid
pattern: '\breject\(\s*[''"\x60]'
targets: [files]
paths: ['*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}']
severity: block
from: benchmark distractor (language)
---
Reject promises with Error objects, never strings.

## Bad
~~~~
reject("timeout")
~~~~

## Good
~~~~
reject(new Error("timeout"))
~~~~
