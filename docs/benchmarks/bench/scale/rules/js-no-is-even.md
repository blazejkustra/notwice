---
kind: forbid
pattern: '(?:\bfrom\s+|\brequire\(\s*|\bimport\(\s*|^\s*import\s+)[''"]is-even(?:/[^''"]*)?[''"]'
targets: [files]
paths: ['*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}']
severity: block
from: benchmark distractor (dependencies)
---
Replace is-even with the % operator.

## Bad
~~~~
import isEven from 'is-even'
~~~~

## Good
~~~~
const even = n % 2 === 0
~~~~
