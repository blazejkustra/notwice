---
kind: forbid
pattern: '\bgit\s+reset\s+--hard\s+(?:origin|upstream)/'
targets: [commands]
severity: block
from: benchmark distractor (commands)
---
Do not reset --hard to a remote branch; it throws away local work.

## Bad
~~~~
git reset --hard origin/main
~~~~

## Good
~~~~
git stash && git rebase origin/main
~~~~
