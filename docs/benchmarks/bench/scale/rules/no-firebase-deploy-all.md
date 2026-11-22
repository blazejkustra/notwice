---
kind: forbid
pattern: '\bfirebase\s+deploy\b(?![^;&|\n]*--only)'
targets: [commands]
severity: block
from: benchmark distractor (commands)
---
firebase deploy needs --only to limit what ships.

## Bad
~~~~
firebase deploy
~~~~

## Good
~~~~
firebase deploy --only functions:api
~~~~
