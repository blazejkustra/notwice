---
kind: forbid
pattern: '/\*\s*eslint-disable\s*\*/'
targets: [files]
paths: ['*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}']
severity: block
from: benchmark distractor (language)
---
Never disable ESLint for a whole file.

## Bad
~~~~
/* eslint-disable */
~~~~

## Good
~~~~
// eslint-disable-next-line no-console -- CLI output
~~~~
