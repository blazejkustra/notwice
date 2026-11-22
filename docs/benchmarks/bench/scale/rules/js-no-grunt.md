---
kind: forbid
pattern: '(?:\bfrom\s+|\brequire\(\s*|\bimport\(\s*|^\s*import\s+)[''"]grunt(?:/[^''"]*)?[''"]'
targets: [files]
paths: ['*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}']
severity: block
from: benchmark distractor (dependencies)
---
grunt is banned in this codebase. Use npm scripts instead.

## Bad
~~~~
import grunt from 'grunt'
~~~~

## Good
~~~~
const scripts = pkg.scripts
~~~~
