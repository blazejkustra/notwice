---
kind: forbid
pattern: '\bnew\s+Buffer\('
targets: [files]
paths: ['*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}']
severity: block
from: benchmark distractor (language)
---
new Buffer() is deprecated; use Buffer.from or Buffer.alloc.

## Bad
~~~~
const buf = new Buffer(data)
~~~~

## Good
~~~~
const buf = Buffer.from(data)
~~~~
