---
kind: forbid
pattern: '\bkubectl\b[^;&|\n]*--context[= ]\S*prod'
targets: [commands]
severity: block
from: benchmark distractor (commands)
---
Never run kubectl against a production context.

## Bad
~~~~
kubectl --context prod-eu apply -f deploy.yaml
~~~~

## Good
~~~~
kubectl --context staging apply -f deploy.yaml
~~~~
