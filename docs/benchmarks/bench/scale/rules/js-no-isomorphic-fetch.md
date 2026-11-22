---
kind: forbid
pattern: '(?:\bfrom\s+|\brequire\(\s*|\bimport\(\s*|^\s*import\s+)[''"]isomorphic-fetch(?:/[^''"]*)?[''"]'
targets: [files]
paths: ['*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}']
severity: block
from: benchmark distractor (dependencies)
---
isomorphic-fetch is banned in this codebase. Use the global fetch instead.

## Bad
~~~~
import isomorphicFetch from 'isomorphic-fetch'
~~~~

## Good
~~~~
const res = await fetch(url)
~~~~
