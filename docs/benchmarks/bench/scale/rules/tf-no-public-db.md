---
kind: forbid
pattern: 'publicly_accessible\s*=\s*true'
targets: [files]
paths: ['*.tf']
severity: block
from: benchmark distractor (infra)
---
Databases are never publicly accessible.

## Bad
~~~~
  publicly_accessible = true
~~~~

## Good
~~~~
  publicly_accessible = false
~~~~
