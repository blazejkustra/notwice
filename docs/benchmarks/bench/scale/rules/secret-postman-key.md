---
kind: forbid
pattern: '\bPMAK-[a-f0-9]{24}-[a-f0-9]{34}\b'
targets: [files, commits, pr, comments]
severity: block
from: benchmark distractor (security)
---
A Postman API key belongs in the secret manager, never in the repo. Reference POSTMAN_API_KEY instead.

## Bad
~~~~
POSTMAN_API_KEY=PMAK-448dbe85a3c671862b18e629-88f5b60e10e593c80718b4f9e1ab501dca
~~~~

## Good
~~~~
POSTMAN_API_KEY=${POSTMAN_API_KEY}
~~~~
