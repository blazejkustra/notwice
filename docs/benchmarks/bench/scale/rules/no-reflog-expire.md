---
kind: forbid
pattern: '\bgit\s+(?:reflog\s+expire|gc\s+--prune=now)\b'
targets: [commands]
severity: block
from: benchmark distractor (commands)
---
Never expire the reflog or prune objects; it removes the undo history.

## Bad
~~~~
git reflog expire --expire=now --all
~~~~

## Good
~~~~
git gc
~~~~
