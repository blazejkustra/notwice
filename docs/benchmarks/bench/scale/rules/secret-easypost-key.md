---
kind: forbid
pattern: '\bEZAK[a-zA-Z0-9]{54}\b'
targets: [files, commits, pr, comments]
severity: block
from: benchmark distractor (security)
---
A EasyPost API key belongs in the secret manager, never in the repo. Reference EASYPOST_API_KEY instead.

## Bad
~~~~
EASYPOST_API_KEY=EZAK9oRTLz0HyLgYsEeXlyHd9Bvs4jYgsMndaa0YxC6EWvOle1I0zAX1kS
~~~~

## Good
~~~~
EASYPOST_API_KEY=${EASYPOST_API_KEY}
~~~~
