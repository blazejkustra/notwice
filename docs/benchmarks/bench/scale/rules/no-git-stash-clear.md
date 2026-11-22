---
kind: forbid
pattern: '\bgit\s+stash\s+clear\b'
targets: [commands]
severity: block
from: benchmark distractor (commands)
---
Never clear the stash; it may hold the user's work.

## Bad
~~~~
git stash clear
~~~~

## Good
~~~~
git stash list
~~~~
