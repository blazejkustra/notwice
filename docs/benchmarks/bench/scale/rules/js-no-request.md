---
kind: forbid
pattern: '(?:\bfrom\s+|\brequire\(\s*|\bimport\(\s*|^\s*import\s+)[''"]request[''"]'
targets: [files]
paths: ['*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}']
severity: block
from: benchmark distractor (dependencies)
---
Do not import request; use the built-in fetch.

## Bad
~~~~
import request from 'request'
~~~~

## Good
~~~~
const res = await fetch(url)
~~~~
