---
kind: forbid
pattern: '-\s*(?:SYS_ADMIN|NET_ADMIN|ALL)\s*$'
targets: [files]
paths: ['k8s/**/*.{yml,yaml}', 'deploy/**/*.{yml,yaml}', 'charts/**/*.{yml,yaml}']
severity: block
from: benchmark distractor (infra)
---
Do not add SYS_ADMIN, NET_ADMIN or ALL capabilities.

## Bad
~~~~
              - SYS_ADMIN
~~~~

## Good
~~~~
              - NET_BIND_SERVICE
~~~~
