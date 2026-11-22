---
kind: forbid
pattern: '^#{1,6}\s{2,}\S'
targets: [files]
paths: ['*.{md,mdx}']
severity: block
from: benchmark distractor (docs)
---
Use one space after the # in headings (MD019).

## Bad
~~~~
##  Usage
~~~~

## Good
~~~~
## Usage
~~~~
