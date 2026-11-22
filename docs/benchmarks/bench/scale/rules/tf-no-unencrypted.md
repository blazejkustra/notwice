---
kind: forbid
pattern: '\b(?:storage_)?encrypted\s*=\s*false'
targets: [files]
paths: ['*.tf']
severity: block
from: benchmark distractor (infra)
---
Storage must be encrypted.

## Bad
~~~~
  storage_encrypted = false
~~~~

## Good
~~~~
  storage_encrypted = true
~~~~
