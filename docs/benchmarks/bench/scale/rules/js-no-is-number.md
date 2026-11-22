---
kind: forbid
pattern: '(?:\bfrom\s+|\brequire\(\s*|\bimport\(\s*|^\s*import\s+)[''"]is-number(?:/[^''"]*)?[''"]'
targets: [files]
paths: ['*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}']
severity: block
from: benchmark distractor (dependencies)
---
is-number is banned in this codebase. Use typeof and Number.isFinite instead.

## Bad
~~~~
import isNumber from 'is-number'
~~~~

## Good
~~~~
const ok = Number.isFinite(value)
~~~~
