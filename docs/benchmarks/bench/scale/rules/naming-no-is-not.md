---
kind: forbid
pattern: '\b(?:const|let)\s+isNot[A-Z]\w*'
targets: [files]
paths: ['*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}']
severity: block
from: benchmark distractor (naming)
---
Name booleans positively (isVisible, not isNotHidden).

## Bad
~~~~
const isNotReady = !ready
~~~~

## Good
~~~~
const isReady = ready
~~~~
