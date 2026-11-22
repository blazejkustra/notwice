---
kind: forbid
pattern: 'JSON\.parse\(\s*JSON\.stringify\('
targets: [files]
paths: ['*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}']
severity: block
from: benchmark distractor (language)
---
Deep copy with structuredClone, not JSON.parse(JSON.stringify()).

## Bad
~~~~
const copy = JSON.parse(JSON.stringify(state))
~~~~

## Good
~~~~
const copy = structuredClone(state)
~~~~
