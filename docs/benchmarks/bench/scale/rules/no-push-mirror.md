---
kind: forbid
pattern: '\bgit\s+push\b[^;&|\n]*\s--mirror\b'
targets: [commands]
severity: block
from: benchmark distractor (commands)
---
Never push --mirror.

## Bad
~~~~
git push --mirror backup
~~~~

## Good
~~~~
git push backup feature
~~~~
