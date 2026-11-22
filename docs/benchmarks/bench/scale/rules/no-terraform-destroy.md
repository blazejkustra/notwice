---
kind: forbid
pattern: '\bterraform\s+destroy\b'
targets: [commands]
severity: block
from: benchmark distractor (commands)
---
Never run terraform destroy.

## Bad
~~~~
terraform destroy
~~~~

## Good
~~~~
terraform plan -destroy
~~~~
