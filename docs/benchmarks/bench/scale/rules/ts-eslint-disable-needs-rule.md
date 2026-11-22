---
kind: forbid
pattern: 'eslint-disable(?:-next-line|-line)?\s*$'
targets: [files]
paths: ['*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}']
severity: block
from: benchmark distractor (language)
---
eslint-disable comments must name the rule they disable.

## Bad
~~~~
// eslint-disable-next-line
~~~~

## Good
~~~~
// eslint-disable-next-line no-console -- CLI output
~~~~
