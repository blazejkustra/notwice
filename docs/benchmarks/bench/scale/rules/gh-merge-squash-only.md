---
kind: forbid
pattern: '\bgh\s+pr\s+merge\b(?![^;&|\n]*(?:--squash|-s\b))'
targets: [commands]
severity: block
from: benchmark distractor (commands)
---
Merge PRs with --squash only.

## Bad
~~~~
gh pr merge 12 --merge
~~~~

## Good
~~~~
gh pr merge 12 --squash
~~~~
