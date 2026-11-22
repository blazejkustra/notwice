---
kind: forbid
pattern: '\bgit\s+update-ref\s+-d\b'
targets: [commands]
severity: block
from: benchmark distractor (commands)
---
Do not delete refs with update-ref.

## Bad
~~~~
git update-ref -d refs/heads/main
~~~~

## Good
~~~~
git branch -d feature
~~~~
