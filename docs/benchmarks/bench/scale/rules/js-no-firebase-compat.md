---
kind: forbid
pattern: '(?:\bfrom\s+|\brequire\(\s*|\bimport\(\s*|^\s*import\s+)[''"]firebase\/compat(?:/[^''"]*)?[''"]'
targets: [files]
paths: ['*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}']
severity: block
from: benchmark distractor (dependencies)
---
firebase/compat is banned in this codebase. Use the modular Firebase SDK instead.

## Bad
~~~~
import firebaseCompat from 'firebase/compat'
~~~~

## Good
~~~~
import { getAuth } from 'firebase/auth'
~~~~
