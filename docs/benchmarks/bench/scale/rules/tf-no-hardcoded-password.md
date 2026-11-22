---
kind: forbid
pattern: '\bpassword\s*=\s*"[^"$]{4,}"'
targets: [files]
paths: ['*.tf']
severity: block
from: benchmark distractor (infra)
---
Never hardcode passwords in Terraform; use a secret reference.

## Bad
~~~~
  password = "hunter22"
~~~~

## Good
~~~~
  password = var.db_password
~~~~
