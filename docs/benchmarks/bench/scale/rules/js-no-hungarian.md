---
kind: forbid
pattern: '\b(?:const|let|var)\s+(?:str|int|bln|obj|arr|num)[A-Z]\w*'
targets: [files]
paths: ['*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}']
severity: block
from: benchmark distractor (naming)
---
No Hungarian notation in names (strName, arrItems).

## Bad
~~~~
const strName = user.name
~~~~

## Good
~~~~
const name = user.name
~~~~
