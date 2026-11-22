---
kind: forbid
pattern: '(?:\bfrom\s+|\brequire\(\s*|\bimport\(\s*|^\s*import\s+)[''"]gulp(?:/[^''"]*)?[''"]'
targets: [files]
paths: ['*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}']
severity: block
from: benchmark distractor (dependencies)
---
gulp is banned in this codebase. Use npm scripts instead.

## Bad
~~~~
import gulp from 'gulp'
~~~~

## Good
~~~~
const scripts = pkg.scripts
~~~~
