---
kind: forbid
pattern: '\?\s*true\s*:\s*false\b|\?\s*false\s*:\s*true\b'
targets: [files]
paths: ['*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}']
severity: block
from: benchmark distractor (language)
---
No condition ? true : false; use the boolean directly.

## Bad
~~~~
const ok = count > 0 ? true : false
~~~~

## Good
~~~~
const ok = count > 0
~~~~
