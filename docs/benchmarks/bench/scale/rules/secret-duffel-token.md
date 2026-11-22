---
kind: forbid
pattern: '\bduffel_(?:test|live)_[A-Za-z0-9_=-]{43}\b'
targets: [files, commits, pr, comments]
severity: block
from: benchmark distractor (security)
---
A Duffel access token belongs in the secret manager, never in the repo. Reference DUFFEL_ACCESS_TOKEN instead.

## Bad
~~~~
DUFFEL_ACCESS_TOKEN=duffel_live_1Fqnzbrt5JX4qn3J0L8c5GtKp6KmrnG878zN4dtzhvX
~~~~

## Good
~~~~
DUFFEL_ACCESS_TOKEN=${DUFFEL_ACCESS_TOKEN}
~~~~
