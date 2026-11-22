---
kind: forbid
pattern: 'Promise\.all\(\s*\[\s*await\b'
targets: [files]
paths: ['*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}']
severity: block
from: benchmark distractor (language)
---
Do not await inside the array passed to Promise.all.

## Bad
~~~~
await Promise.all([await a(), await b()])
~~~~

## Good
~~~~
await Promise.all([a(), b()])
~~~~
