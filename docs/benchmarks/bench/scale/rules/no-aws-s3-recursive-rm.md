---
kind: forbid
pattern: '\baws\s+s3\s+(?:rm\b[^;&|\n]*--recursive|rb\b[^;&|\n]*--force)'
targets: [commands]
severity: block
from: benchmark distractor (commands)
---
Never delete S3 buckets or prefixes recursively.

## Bad
~~~~
aws s3 rm s3://assets --recursive
~~~~

## Good
~~~~
aws s3 ls s3://assets
~~~~
