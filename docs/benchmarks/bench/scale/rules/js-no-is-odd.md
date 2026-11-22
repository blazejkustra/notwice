---
kind: forbid
pattern: '(?:\bfrom\s+|\brequire\(\s*|\bimport\(\s*|^\s*import\s+)[''"]is-odd(?:/[^''"]*)?[''"]'
targets: [files]
paths: ['*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}']
severity: block
from: benchmark distractor (dependencies)
---
No new code depends on is-odd; reach for the % operator.

## Bad
~~~~
import isOdd from 'is-odd'
~~~~

## Good
~~~~
const odd = n % 2 === 1
~~~~
