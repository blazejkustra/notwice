---
kind: forbid
pattern: 'force_destroy\s*=\s*true'
targets: [files]
paths: ['*.tf']
severity: block
from: benchmark distractor (infra)
---
Never set force_destroy on buckets.

## Bad
~~~~
  force_destroy = true
~~~~

## Good
~~~~
  force_destroy = false
~~~~
