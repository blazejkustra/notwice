---
kind: forbid
pattern: '\bgh\s+workflow\s+run\s+\S*(?:deploy|release|publish)\b'
targets: [commands]
severity: block
from: benchmark distractor (commands)
---
Do not trigger deploy or release workflows from a session.

## Bad
~~~~
gh workflow run deploy.yml
~~~~

## Good
~~~~
gh workflow view deploy.yml
~~~~
