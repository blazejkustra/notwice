---
kind: forbid
pattern: '\bGOCSPX-[A-Za-z0-9_-]{28}\b'
targets: [files, commits, pr, comments]
severity: block
from: benchmark distractor (security)
---
Never commit a Google OAuth client secret. Read it from GOOGLE_CLIENT_SECRET at runtime.

## Bad
~~~~
GOOGLE_CLIENT_SECRET=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
~~~~

## Good
~~~~
GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET}
~~~~
