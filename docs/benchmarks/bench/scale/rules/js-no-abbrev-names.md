---
kind: forbid
pattern: '\b(?:const|let)\s+(?:btn|msg|usr|cfg|mgr|ctrl|svc|tmpVal|arr|obj)\b'
targets: [files]
paths: ['*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}']
severity: block
from: benchmark distractor (naming)
---
Use full words for variable names: button, message, user, config.

## Bad
~~~~
const btn = screen.getByRole("button")
~~~~

## Good
~~~~
const button = screen.getByRole("button")
~~~~
