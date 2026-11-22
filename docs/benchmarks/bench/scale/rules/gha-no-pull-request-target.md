---
kind: forbid
pattern: '^\s*pull_request_target\s*:'
targets: [files]
paths: ['.github/workflows/*.{yml,yaml}']
severity: block
from: benchmark distractor (infra)
---
Do not use pull_request_target; it runs untrusted code with secrets.

## Bad
~~~~
  pull_request_target:
~~~~

## Good
~~~~
  pull_request:
~~~~
