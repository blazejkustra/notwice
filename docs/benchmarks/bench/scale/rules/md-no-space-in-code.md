---
kind: forbid
pattern: '\x60\s+[^\x60]+\s+\x60'
targets: [files]
paths: ['*.{md,mdx}']
severity: block
from: benchmark distractor (docs)
---
No spaces inside code spans (MD038).

## Bad
~~~~
Run ` npm test ` first
~~~~

## Good
~~~~
Run `npm test` first
~~~~
