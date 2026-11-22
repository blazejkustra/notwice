---
kind: forbid
pattern: 'privileged:\s*true\b'
targets: [files]
paths: ['k8s/**/*.{yml,yaml}', 'deploy/**/*.{yml,yaml}', 'charts/**/*.{yml,yaml}']
severity: block
from: benchmark distractor (infra)
---
No privileged pods.

## Bad
~~~~
          privileged: true
~~~~

## Good
~~~~
          privileged: false
~~~~
