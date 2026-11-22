---
kind: forbid
pattern: 'namespace:\s*default\b'
targets: [files]
paths: ['k8s/**/*.{yml,yaml}', 'deploy/**/*.{yml,yaml}', 'charts/**/*.{yml,yaml}']
severity: block
from: benchmark distractor (infra)
---
Deploy to a named namespace, never default.

## Bad
~~~~
  namespace: default
~~~~

## Good
~~~~
  namespace: payments
~~~~
