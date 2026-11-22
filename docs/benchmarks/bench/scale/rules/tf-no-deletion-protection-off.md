---
kind: forbid
pattern: 'deletion_protection\s*=\s*false'
targets: [files]
paths: ['*.tf']
severity: block
from: benchmark distractor (infra)
---
Keep deletion protection on.

## Bad
~~~~
  deletion_protection = false
~~~~

## Good
~~~~
  deletion_protection = true
~~~~
