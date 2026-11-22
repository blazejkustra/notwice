---
kind: forbid
pattern: '(?:\bfrom\s+|\brequire\(\s*|\bimport\(\s*|^\s*import\s+)[''"]object-assign(?:/[^''"]*)?[''"]'
targets: [files]
paths: ['*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}']
severity: block
from: benchmark distractor (dependencies)
---
Replace object-assign with object spread.

## Bad
~~~~
import objectAssign from 'object-assign'
~~~~

## Good
~~~~
const next = { ...state, ...patch }
~~~~
