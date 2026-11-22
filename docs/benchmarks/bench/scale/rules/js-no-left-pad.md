---
kind: forbid
pattern: '(?:\bfrom\s+|\brequire\(\s*|\bimport\(\s*|^\s*import\s+)[''"]left-pad(?:/[^''"]*)?[''"]'
targets: [files]
paths: ['*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}']
severity: block
from: benchmark distractor (dependencies)
---
Do not import left-pad; use String.prototype.padStart.

## Bad
~~~~
import leftPad from 'left-pad'
~~~~

## Good
~~~~
const id = String(n).padStart(4, '0')
~~~~
