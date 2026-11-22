---
kind: forbid
pattern: '\bObject\.assign\(\s*\{\s*\}'
targets: [files]
paths: ['*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}']
severity: block
from: benchmark distractor (language)
---
Use object spread instead of Object.assign({}, ...).

## Bad
~~~~
const next = Object.assign({}, state, patch)
~~~~

## Good
~~~~
const next = { ...state, ...patch }
~~~~
