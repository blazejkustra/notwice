---
kind: forbid
pattern: '\bSG\.[A-Za-z0-9_-]{22}\.[A-Za-z0-9_-]{43}\b'
targets: [files, commits, pr, comments]
severity: block
from: benchmark distractor (security)
---
A SendGrid API key belongs in the secret manager, never in the repo. Reference SENDGRID_API_KEY instead.

## Bad
~~~~
SENDGRID_API_KEY=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
~~~~

## Good
~~~~
SENDGRID_API_KEY=${SENDGRID_API_KEY}
~~~~
