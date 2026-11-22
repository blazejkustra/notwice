---
kind: forbid
pattern: '\.insertAdjacentHTML\('
targets: [files]
paths: ['*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}']
severity: block
from: benchmark distractor (security)
---
Avoid insertAdjacentHTML with dynamic content; build nodes instead.

## Bad
~~~~
list.insertAdjacentHTML("beforeend", row)
~~~~

## Good
~~~~
list.append(rowNode)
~~~~
