---
kind: forbid
pattern: '\bkey-[0-9a-f]{32}\b'
targets: [files, commits, pr, comments]
severity: block
from: benchmark distractor (security)
---
No Mailgun API key in code, commits, PRs or comments; load it from the environment (MAILGUN_API_KEY).

## Bad
~~~~
MAILGUN_API_KEY=key-85605f01b9188b4e804bd89bd9a77200
~~~~

## Good
~~~~
MAILGUN_API_KEY=${MAILGUN_API_KEY}
~~~~
