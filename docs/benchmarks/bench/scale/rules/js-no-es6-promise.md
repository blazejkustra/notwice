---
kind: forbid
pattern: '(?:\bfrom\s+|\brequire\(\s*|\bimport\(\s*|^\s*import\s+)[''"]es6-promise(?:/[^''"]*)?[''"]'
targets: [files]
paths: ['*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}']
severity: block
from: benchmark distractor (dependencies)
---
No new code depends on es6-promise; reach for native promises.

## Bad
~~~~
import es6Promise from 'es6-promise'
~~~~

## Good
~~~~
await Promise.resolve()
~~~~
