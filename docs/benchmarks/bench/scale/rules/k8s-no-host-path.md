---
kind: forbid
pattern: '^\s*hostPath:'
targets: [files]
paths: ['k8s/**/*.{yml,yaml}', 'deploy/**/*.{yml,yaml}', 'charts/**/*.{yml,yaml}']
severity: block
from: benchmark distractor (infra)
---
No hostPath volumes.

## Bad
~~~~
        hostPath:
~~~~

## Good
~~~~
        emptyDir: {}
~~~~
