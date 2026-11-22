---
kind: forbid
pattern: '\b(?:AKIA|ASIA|ABIA|ACCA)[0-9A-Z]{16}\b'
targets: [files, commits, pr, comments]
severity: block
from: benchmark distractor (security)
---
Never commit a AWS access key ID. Read it from AWS_ACCESS_KEY_ID at runtime.

## Bad
~~~~
AWS_ACCESS_KEY_ID=AKIA9GH9CH9QB1DZWXJS
~~~~

## Good
~~~~
AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}
~~~~
