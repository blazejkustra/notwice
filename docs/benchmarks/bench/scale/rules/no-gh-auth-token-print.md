---
kind: forbid
pattern: '\bgh\s+auth\s+token\b'
targets: [commands]
severity: block
from: benchmark distractor (commands)
---
Never print the gh auth token.

## Bad
~~~~
gh auth token
~~~~

## Good
~~~~
gh auth status
~~~~
