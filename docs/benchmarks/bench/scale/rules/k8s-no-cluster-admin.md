---
kind: forbid
pattern: 'name:\s*cluster-admin\b'
targets: [files]
paths: ['k8s/**/*.{yml,yaml}', 'deploy/**/*.{yml,yaml}', 'charts/**/*.{yml,yaml}']
severity: block
from: benchmark distractor (infra)
---
Never bind cluster-admin to workloads.

## Bad
~~~~
  name: cluster-admin
~~~~

## Good
~~~~
  name: payments-reader
~~~~
