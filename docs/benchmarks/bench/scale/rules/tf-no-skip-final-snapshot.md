---
kind: forbid
pattern: 'skip_final_snapshot\s*=\s*true'
targets: [files]
paths: ['*.tf']
severity: block
from: benchmark distractor (infra)
---
Keep final snapshots for databases.

## Bad
~~~~
  skip_final_snapshot = true
~~~~

## Good
~~~~
  skip_final_snapshot = false
~~~~
