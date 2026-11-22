---
kind: forbid
pattern: 'acl\s*=\s*"public-read(?:-write)?"'
targets: [files]
paths: ['*.tf']
severity: block
from: benchmark distractor (infra)
---
S3 buckets are never public-read.

## Bad
~~~~
  acl = "public-read"
~~~~

## Good
~~~~
  acl = "private"
~~~~
