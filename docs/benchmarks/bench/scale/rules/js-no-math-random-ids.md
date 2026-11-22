---
kind: forbid
pattern: 'Math\.random\(\)\.toString\(36\)'
targets: [files]
paths: ['*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}']
severity: block
from: benchmark distractor (security)
---
Never build IDs or tokens from Math.random; use crypto.randomUUID.

## Bad
~~~~
const id = Math.random().toString(36).slice(2)
~~~~

## Good
~~~~
const id = crypto.randomUUID()
~~~~
