---
kind: forbid
pattern: '\btk-us-[A-Za-z0-9_-]{48}\b'
targets: [files, commits, pr, comments]
severity: block
from: benchmark distractor (security)
---
A Scalingo API token belongs in the secret manager, never in the repo. Reference SCALINGO_API_TOKEN instead.

## Bad
~~~~
SCALINGO_API_TOKEN=tk-us-ldGmBu7a2iBLNPAb25BgM73ORUdrrcFH8p9yZJJm6eFz3r0f
~~~~

## Good
~~~~
SCALINGO_API_TOKEN=${SCALINGO_API_TOKEN}
~~~~
