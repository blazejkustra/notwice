---
kind: forbid
pattern: '^\s*(?:[-*+]|\d+\.)\s{2,}\S'
targets: [files]
paths: ['*.{md,mdx}']
severity: block
from: benchmark distractor (docs)
---
One space after list markers (MD030).

## Bad
~~~~
-  first item
~~~~

## Good
~~~~
- first item
~~~~
