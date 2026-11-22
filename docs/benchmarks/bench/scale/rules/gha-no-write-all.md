---
kind: forbid
pattern: '^\s*permissions:\s*write-all\b'
targets: [files]
paths: ['.github/workflows/*.{yml,yaml}']
severity: block
from: benchmark distractor (infra)
---
Never grant write-all permissions; list what the job needs.

## Bad
~~~~
permissions: write-all
~~~~

## Good
~~~~
permissions:
~~~~
