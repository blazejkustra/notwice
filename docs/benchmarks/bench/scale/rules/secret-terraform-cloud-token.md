---
kind: forbid
pattern: '\b[A-Za-z0-9]{14}\.atlasv1\.[A-Za-z0-9_-]{60,70}\b'
targets: [files, commits, pr, comments]
severity: block
from: benchmark distractor (security)
---
A Terraform Cloud token belongs in the secret manager, never in the repo. Reference TF_TOKEN_app_terraform_io instead.

## Bad
~~~~
TF_TOKEN_app_terraform_io=V2Kh6pWdHx33kY.atlasv1.aA9xqYouCwDt0JLelxoHG1QmHfEHTEaGSjvuKcfCUN8AchdOKQ91OX4RCAtza8NDZ3o
~~~~

## Good
~~~~
TF_TOKEN_app_terraform_io=${TF_TOKEN_app_terraform_io}
~~~~
