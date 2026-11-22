---
kind: forbid
pattern: '\bdelete\s+\w+\[\s*\d+\s*\]'
targets: [files]
paths: ['*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}']
severity: block
from: benchmark distractor (language)
---
Do not delete array elements; use splice or filter.

## Bad
~~~~
delete items[2]
~~~~

## Good
~~~~
items.splice(2, 1)
~~~~
