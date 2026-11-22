---
kind: forbid
pattern: '\bFLWSECK(?:_TEST)?-[a-h0-9]{32}-X\b'
targets: [files, commits, pr, comments]
severity: block
from: benchmark distractor (security)
---
A Flutterwave secret key belongs in the secret manager, never in the repo. Reference FLW_SECRET_KEY instead.

## Bad
~~~~
FLW_SECRET_KEY=FLWSECK-db1cd09aa62ef27b1a1bc1731e682995-X
~~~~

## Good
~~~~
FLW_SECRET_KEY=${FLW_SECRET_KEY}
~~~~
