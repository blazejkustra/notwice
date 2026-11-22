---
kind: forbid
pattern: '(?:\bfrom\s+|\brequire\(\s*|\bimport\(\s*|^\s*import\s+)[''"]deep-extend(?:/[^''"]*)?[''"]'
targets: [files]
paths: ['*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}']
severity: block
from: benchmark distractor (dependencies)
---
Do not import deep-extend; use structuredClone and spread.

## Bad
~~~~
import deepExtend from 'deep-extend'
~~~~

## Good
~~~~
const merged = { ...defaults, ...options }
~~~~
