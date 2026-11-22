---
kind: forbid
pattern: '(?<![\w.])void\s+0\b'
targets: [files]
paths: ['*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}']
severity: block
from: benchmark distractor (language)
---
Write undefined, not void 0.

## Bad
~~~~
if (value === void 0) return
~~~~

## Good
~~~~
if (value === undefined) return
~~~~
