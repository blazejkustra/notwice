---
kind: forbid
pattern: '(?:\bfrom\s+|\brequire\(\s*|\bimport\(\s*|^\s*import\s+)[''"]proxyquire(?:/[^''"]*)?[''"]'
targets: [files]
paths: ['*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}']
severity: block
from: benchmark distractor (dependencies)
---
proxyquire is banned in this codebase. Use vi.mock instead.

## Bad
~~~~
import proxyquire from 'proxyquire'
~~~~

## Good
~~~~
vi.mock('./db')
~~~~
