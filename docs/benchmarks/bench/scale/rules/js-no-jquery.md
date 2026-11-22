---
kind: forbid
pattern: '(?:\bfrom\s+|\brequire\(\s*|\bimport\(\s*|^\s*import\s+)[''"]jquery(?:/[^''"]*)?[''"]'
targets: [files]
paths: ['*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}']
severity: block
from: benchmark distractor (dependencies)
---
jquery is banned in this codebase. Use DOM APIs instead.

## Bad
~~~~
import jquery from 'jquery'
~~~~

## Good
~~~~
const button = document.querySelector('#save')
~~~~
