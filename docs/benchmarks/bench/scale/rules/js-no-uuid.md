---
kind: forbid
pattern: '(?:\bfrom\s+|\brequire\(\s*|\bimport\(\s*|^\s*import\s+)[''"]uuid[''"]'
targets: [files]
paths: ['*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}']
severity: block
from: benchmark distractor (dependencies)
---
Replace uuid with crypto.randomUUID().

## Bad
~~~~
import uuid from 'uuid'
~~~~

## Good
~~~~
const id = crypto.randomUUID()
~~~~
