---
kind: forbid
pattern: '\bgh\s+repo\s+delete\b'
targets: [commands]
severity: block
from: benchmark distractor (commands)
---
Never delete GitHub repositories.

## Bad
~~~~
gh repo delete me/app --yes
~~~~

## Good
~~~~
gh repo view me/app
~~~~
