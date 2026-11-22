---
kind: forbid
pattern: '(?:\bfrom\s+|\brequire\(\s*|\bimport\(\s*|^\s*import\s+)[''"]node-uuid(?:/[^''"]*)?[''"]'
targets: [files]
paths: ['*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}']
severity: block
from: benchmark distractor (dependencies)
---
No new code depends on node-uuid; reach for crypto.randomUUID().

## Bad
~~~~
import nodeUuid from 'node-uuid'
~~~~

## Good
~~~~
const id = crypto.randomUUID()
~~~~
