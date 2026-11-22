---
kind: forbid
pattern: '(?:\bfrom\s+|\brequire\(\s*|\bimport\(\s*|^\s*import\s+)[''"]vm2(?:/[^''"]*)?[''"]'
targets: [files]
paths: ['*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}']
severity: block
from: benchmark distractor (dependencies)
---
Do not import vm2; use isolated-vm or a separate process.

## Bad
~~~~
import vm2 from 'vm2'
~~~~

## Good
~~~~
import ivm from 'isolated-vm'
~~~~
