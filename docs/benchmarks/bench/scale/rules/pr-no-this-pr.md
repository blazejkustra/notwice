---
kind: forbid
pattern: '\bThis PR\b'
targets: [pr]
severity: block
from: benchmark distractor (git)
---
Do not start PR prose with "This PR"; say what changed.

## Bad
~~~~
This PR adds caching.
~~~~

## Good
~~~~
Adds a 60 second cache to the API client.
~~~~
