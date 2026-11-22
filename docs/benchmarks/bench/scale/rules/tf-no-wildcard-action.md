---
kind: forbid
pattern: '(?:"Action"|actions?)\s*[:=]\s*\[?\s*"\*"'
targets: [files]
paths: ['*.tf']
severity: block
from: benchmark distractor (infra)
---
IAM policies never allow every action.

## Bad
~~~~
  actions = ["*"]
~~~~

## Good
~~~~
  actions = ["s3:GetObject"]
~~~~
