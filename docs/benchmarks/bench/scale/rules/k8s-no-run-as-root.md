---
kind: forbid
pattern: 'runAsUser:\s*0\b'
targets: [files]
paths: ['k8s/**/*.{yml,yaml}', 'deploy/**/*.{yml,yaml}', 'charts/**/*.{yml,yaml}']
severity: block
from: benchmark distractor (infra)
---
Containers do not run as UID 0.

## Bad
~~~~
          runAsUser: 0
~~~~

## Good
~~~~
          runAsUser: 10001
~~~~
