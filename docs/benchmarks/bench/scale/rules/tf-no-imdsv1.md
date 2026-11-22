---
kind: forbid
pattern: 'http_tokens\s*=\s*"optional"'
targets: [files]
paths: ['*.tf']
severity: block
from: benchmark distractor (infra)
---
Require IMDSv2: http_tokens = "required".

## Bad
~~~~
    http_tokens = "optional"
~~~~

## Good
~~~~
    http_tokens = "required"
~~~~
