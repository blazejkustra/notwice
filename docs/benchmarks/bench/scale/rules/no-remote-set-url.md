---
kind: forbid
pattern: '\bgit\s+remote\s+set-url\b'
targets: [commands]
severity: block
from: benchmark distractor (commands)
---
Do not change remotes without asking.

## Bad
~~~~
git remote set-url origin git@github.com:me/fork.git
~~~~

## Good
~~~~
git remote -v
~~~~
