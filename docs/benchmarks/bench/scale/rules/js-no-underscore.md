---
kind: forbid
pattern: '(?:\bfrom\s+|\brequire\(\s*|\bimport\(\s*|^\s*import\s+)[''"]underscore(?:/[^''"]*)?[''"]'
targets: [files]
paths: ['*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}']
severity: block
from: benchmark distractor (dependencies)
---
underscore is banned in this codebase. Use native array and object methods instead.

## Bad
~~~~
import underscore from 'underscore'
~~~~

## Good
~~~~
const ids = users.map((u) => u.id)
~~~~
