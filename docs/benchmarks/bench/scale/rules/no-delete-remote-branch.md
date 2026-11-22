---
kind: forbid
pattern: '\bgit\s+push\s+\S+\s+(?:--delete\s+|:)(?:main|master|develop|release)'
targets: [commands]
severity: block
from: benchmark distractor (commands)
---
Never delete protected remote branches.

## Bad
~~~~
git push origin --delete main
~~~~

## Good
~~~~
git push origin --delete old-experiment
~~~~
