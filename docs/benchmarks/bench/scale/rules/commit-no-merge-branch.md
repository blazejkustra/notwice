---
kind: forbid
pattern: '^Merge branch ''[^'']+'' (?:of|into)\b'
targets: [commits]
severity: block
from: benchmark distractor (git)
---
Rebase instead of merging main into feature branches.

## Bad
~~~~
Merge branch 'main' into feature
~~~~

## Good
~~~~
Rebase on main
~~~~
