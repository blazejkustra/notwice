---
kind: forbid
pattern: '\bgh\s+pr\s+merge\b[^;&|\n]*--admin\b'
targets: [commands]
severity: block
from: benchmark distractor (commands)
---
Never bypass branch protection with gh pr merge --admin.

## Bad
~~~~
gh pr merge 12 --admin --squash
~~~~

## Good
~~~~
gh pr merge 12 --auto --squash
~~~~
