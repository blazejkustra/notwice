---
kind: forbid
pattern: 'allowPrivilegeEscalation:\s*true\b'
targets: [files]
paths: ['k8s/**/*.{yml,yaml}', 'deploy/**/*.{yml,yaml}', 'charts/**/*.{yml,yaml}']
severity: block
from: benchmark distractor (infra)
---
Set allowPrivilegeEscalation: false.

## Bad
~~~~
          allowPrivilegeEscalation: true
~~~~

## Good
~~~~
          allowPrivilegeEscalation: false
~~~~
