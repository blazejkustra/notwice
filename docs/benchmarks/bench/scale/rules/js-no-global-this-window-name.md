---
kind: forbid
pattern: '\bwindow\.name\s*='
targets: [files]
paths: ['*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}']
severity: block
from: benchmark distractor (naming)
---
Never store data in window.name.

## Bad
~~~~
window.name = JSON.stringify(state)
~~~~

## Good
~~~~
sessionStorage.setItem("state", JSON.stringify(state))
~~~~
