---
kind: forbid
pattern: '^\s*\*\s+\S'
targets: [files]
paths: ['*.{md,mdx}']
severity: block
from: benchmark distractor (docs)
---
Use - for bullet lists, not * (MD004).

## Bad
~~~~
* first item
~~~~

## Good
~~~~
- first item
~~~~
