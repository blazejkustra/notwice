---
kind: forbid
pattern: '<!--\s*TODO'
targets: [files]
paths: ['*.{md,mdx}']
severity: block
from: benchmark distractor (docs)
---
No TODO comments hidden in Markdown; open an issue.

## Bad
~~~~
<!-- TODO: add screenshots -->
~~~~

## Good
~~~~
See issue #12 for screenshots.
~~~~
