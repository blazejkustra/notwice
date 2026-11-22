---
kind: forbid
pattern: '\bterraform\s+(?:apply|destroy)\b[^;&|\n]*-auto-approve\b'
targets: [commands]
severity: block
from: benchmark distractor (commands)
---
Never terraform apply or destroy with -auto-approve.

## Bad
~~~~
terraform apply -auto-approve
~~~~

## Good
~~~~
terraform plan -out plan.tfplan
~~~~
