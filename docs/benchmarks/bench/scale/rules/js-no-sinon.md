---
kind: forbid
pattern: '(?:\bfrom\s+|\brequire\(\s*|\bimport\(\s*|^\s*import\s+)[''"]sinon(?:/[^''"]*)?[''"]'
targets: [files]
paths: ['*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}']
severity: block
from: benchmark distractor (dependencies)
---
Do not import sinon; use vi.fn and vi.spyOn.

## Bad
~~~~
import sinon from 'sinon'
~~~~

## Good
~~~~
const spy = vi.spyOn(api, "get")
~~~~
