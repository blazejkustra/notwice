---
kind: forbid
pattern: '\bgit\s+push\s+\S+\s+(?:HEAD:)?(?:main|master)\b'
targets: [commands]
severity: block
from: benchmark distractor (commands)
---
Never push straight to main or master; open a PR.

## Bad
~~~~
git push origin main
~~~~

## Good
~~~~
git push -u origin feature
~~~~
