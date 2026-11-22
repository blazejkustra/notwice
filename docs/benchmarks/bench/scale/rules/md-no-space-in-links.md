---
kind: forbid
pattern: '\[\s+[^\]]*\]\(|\[[^\]]*\s+\]\('
targets: [files]
paths: ['*.{md,mdx}']
severity: block
from: benchmark distractor (docs)
---
No spaces inside link text (MD039).

## Bad
~~~~
[ Docs ](docs.md)
~~~~

## Good
~~~~
[Docs](docs.md)
~~~~
