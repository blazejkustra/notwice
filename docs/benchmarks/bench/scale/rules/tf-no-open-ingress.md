---
kind: forbid
pattern: 'cidr_blocks\s*=\s*\[\s*"0\.0\.0\.0/0"\s*\]'
targets: [files]
paths: ['*.tf']
severity: block
from: benchmark distractor (infra)
---
Never open security groups to 0.0.0.0/0.

## Bad
~~~~
  cidr_blocks = ["0.0.0.0/0"]
~~~~

## Good
~~~~
  cidr_blocks = [var.office_cidr]
~~~~
