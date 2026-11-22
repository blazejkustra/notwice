---
kind: forbid
pattern: '\bgit\s+rebase\s+(?:-i|--interactive)\b'
targets: [commands]
severity: block
from: benchmark distractor (commands)
---
Agents cannot drive interactive rebase; use --autosquash with GIT_SEQUENCE_EDITOR or ask.

## Bad
~~~~
git rebase -i HEAD~3
~~~~

## Good
~~~~
git rebase origin/main
~~~~
