---
kind: forbid
pattern: '\bkubectl\b[^;&|\n]*\sdelete\s+(?:ns|namespace)\b'
targets: [commands]
severity: block
from: benchmark distractor (commands)
---
Never delete Kubernetes namespaces.

## Bad
~~~~
kubectl delete namespace staging
~~~~

## Good
~~~~
kubectl get namespace staging
~~~~
