---
kind: forbid
pattern: '(?:\bfrom\s+|\brequire\(\s*|\bimport\(\s*|^\s*import\s+)[''"]querystring[''"]'
targets: [files]
paths: ['*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}']
severity: block
from: benchmark distractor (dependencies)
---
Replace querystring with URLSearchParams.

## Bad
~~~~
import querystring from 'querystring'
~~~~

## Good
~~~~
const params = new URLSearchParams(search)
~~~~
