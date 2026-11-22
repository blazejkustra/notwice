---
kind: forbid
pattern: '\bgh\s+api\b[^;&|\n]*(?:-X|--method)\s+DELETE\b'
targets: [commands]
severity: block
from: benchmark distractor (commands)
---
Do not call DELETE endpoints with gh api.

## Bad
~~~~
gh api -X DELETE repos/me/app/hooks/1
~~~~

## Good
~~~~
gh api repos/me/app/hooks
~~~~
