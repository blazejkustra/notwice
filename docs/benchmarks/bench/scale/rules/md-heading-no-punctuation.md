---
kind: forbid
pattern: '^#{1,6}\s.*[.,;:!]\s*$'
targets: [files]
paths: ['*.{md,mdx}']
severity: block
from: benchmark distractor (docs)
---
Headings do not end with punctuation (MD026).

## Bad
~~~~
## Installation:
~~~~

## Good
~~~~
## Installation
~~~~
