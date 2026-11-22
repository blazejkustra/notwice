---
kind: forbid
pattern: '\bgit\s+(?:tag\s+-d|push\s+\S+\s+:refs/tags/)'
targets: [commands]
severity: block
from: benchmark distractor (commands)
---
Do not delete release tags.

## Bad
~~~~
git tag -d v1.2.0
~~~~

## Good
~~~~
git tag v1.2.1
~~~~
