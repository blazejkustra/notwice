---
kind: forbid
pattern: '^(?:\*\s*){3,}$|^(?:_\s*){3,}$'
targets: [files]
paths: ['*.{md,mdx}']
severity: block
from: benchmark distractor (docs)
---
Use --- for horizontal rules (MD035).

## Bad
~~~~
***
~~~~

## Good
~~~~
---
~~~~
