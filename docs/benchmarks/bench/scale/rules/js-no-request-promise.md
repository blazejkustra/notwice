---
kind: forbid
pattern: '(?:\bfrom\s+|\brequire\(\s*|\bimport\(\s*|^\s*import\s+)[''"]request-promise(?:/[^''"]*)?[''"]'
targets: [files]
paths: ['*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}']
severity: block
from: benchmark distractor (dependencies)
---
Replace request-promise with the built-in fetch.

## Bad
~~~~
import requestPromise from 'request-promise'
~~~~

## Good
~~~~
const res = await fetch(url)
~~~~
