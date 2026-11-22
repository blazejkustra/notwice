---
kind: forbid
pattern: '(?:\bfrom\s+|\brequire\(\s*|\bimport\(\s*|^\s*import\s+)[''"]node-fetch(?:/[^''"]*)?[''"]'
targets: [files]
paths: ['*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}']
severity: block
from: benchmark distractor (dependencies)
---
Replace node-fetch with the global fetch in Node 18+.

## Bad
~~~~
import nodeFetch from 'node-fetch'
~~~~

## Good
~~~~
const res = await fetch(url)
~~~~
