---
kind: forbid
pattern: '\bgh\s+issue\s+close\b(?![^;&|\n]*(?:--comment|-c)[\s=]+\S)'
targets: [commands]
severity: block
from: benchmark distractor (commands)
---
Close issues only with a comment that says why.

## Bad
~~~~
gh issue close 42
~~~~

## Good
~~~~
gh issue close 42 --comment "Fixed in #57"
~~~~
