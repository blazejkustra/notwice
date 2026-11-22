---
kind: forbid
pattern: '"type":\s*"service_account"'
targets: [files, commits, pr, comments]
severity: block
from: benchmark distractor (security)
---
A GCP service account key file belongs in the secret manager, never in the repo. Reference GOOGLE_APPLICATION_CREDENTIALS instead.

## Bad
~~~~
"type": "service_account",
~~~~

## Good
~~~~
GOOGLE_APPLICATION_CREDENTIALS=${GOOGLE_APPLICATION_CREDENTIALS}
~~~~
