---
kind: forbid
pattern: '(?:\bfrom\s+|\brequire\(\s*|\bimport\(\s*|^\s*import\s+)[''"]bcrypt-nodejs(?:/[^''"]*)?[''"]'
targets: [files]
paths: ['*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}']
severity: block
from: benchmark distractor (dependencies)
---
bcrypt-nodejs is banned in this codebase. Use bcrypt instead.

## Bad
~~~~
import bcryptNodejs from 'bcrypt-nodejs'
~~~~

## Good
~~~~
import bcrypt from 'bcrypt'
~~~~
