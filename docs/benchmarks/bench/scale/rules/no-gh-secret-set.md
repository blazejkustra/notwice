---
kind: forbid
pattern: '\bgh\s+secret\s+(?:set|delete)\b'
targets: [commands]
severity: block
from: benchmark distractor (commands)
---
Only the user changes repository secrets.

## Bad
~~~~
gh secret set NPM_TOKEN --body "$TOKEN"
~~~~

## Good
~~~~
gh secret list
~~~~
