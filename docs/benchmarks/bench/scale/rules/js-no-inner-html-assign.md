---
kind: forbid
pattern: '\.innerHTML\s*\+?=(?!=)'
targets: [files]
paths: ['*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}']
severity: block
from: benchmark distractor (security)
---
Do not assign innerHTML; use textContent or a sanitizer.

## Bad
~~~~
el.innerHTML = message
~~~~

## Good
~~~~
el.textContent = message
~~~~
