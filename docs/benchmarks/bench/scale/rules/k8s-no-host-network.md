---
kind: forbid
pattern: 'host(?:Network|PID|IPC):\s*true\b'
targets: [files]
paths: ['k8s/**/*.{yml,yaml}', 'deploy/**/*.{yml,yaml}', 'charts/**/*.{yml,yaml}']
severity: block
from: benchmark distractor (infra)
---
Pods do not share the host network, PID or IPC namespace.

## Bad
~~~~
      hostNetwork: true
~~~~

## Good
~~~~
      hostNetwork: false
~~~~
