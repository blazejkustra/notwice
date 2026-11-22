---
kind: forbid
pattern: '\brm\s+-[a-zA-Z]*r[a-zA-Z]*\s+(?:\S*/)?\.git(?:\s|$)'
targets: [commands]
severity: block
from: benchmark distractor (commands)
---
Never delete the .git folder.

## Bad
~~~~
rm -rf .git
~~~~

## Good
~~~~
git status
~~~~
