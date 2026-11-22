---
kind: forbid
pattern: '(?:\bfrom\s+|\brequire\(\s*|\bimport\(\s*|^\s*import\s+)[''"]tslint(?:/[^''"]*)?[''"]'
targets: [files]
paths: ['*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}']
severity: block
from: benchmark distractor (dependencies)
---
tslint is banned in this codebase. Use ESLint with typescript-eslint instead.

## Bad
~~~~
import tslint from 'tslint'
~~~~

## Good
~~~~
import tseslint from 'typescript-eslint'
~~~~
