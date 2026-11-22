---
kind: forbid
pattern: '^\s*secrets:\s*inherit\b'
targets: [files]
paths: ['.github/workflows/*.{yml,yaml}']
severity: block
from: benchmark distractor (infra)
---
Pass only the secrets a reusable workflow needs, not inherit.

## Bad
~~~~
    secrets: inherit
~~~~

## Good
~~~~
    secrets:
~~~~
