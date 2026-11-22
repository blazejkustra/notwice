---
kind: forbid
pattern: '\bgit\s+branch\s+-D\s+(?:main|master|develop)\b'
targets: [commands]
severity: block
from: benchmark distractor (commands)
---
Never delete main, master or develop.

## Bad
~~~~
git branch -D main
~~~~

## Good
~~~~
git branch -d feature
~~~~
