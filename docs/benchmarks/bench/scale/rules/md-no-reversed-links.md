---
kind: forbid
pattern: '\([^)\s]+\)\[[^\]]+\]'
targets: [files]
paths: ['*.{md,mdx}']
severity: block
from: benchmark distractor (docs)
---
Reversed link syntax: write [text](url) (MD011).

## Bad
~~~~
(docs.md)[Docs]
~~~~

## Good
~~~~
[Docs](docs.md)
~~~~
