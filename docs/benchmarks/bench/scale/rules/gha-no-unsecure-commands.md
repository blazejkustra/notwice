---
kind: forbid
pattern: 'ACTIONS_ALLOW_UNSECURE_COMMANDS'
targets: [files]
paths: ['.github/workflows/*.{yml,yaml}']
severity: block
from: benchmark distractor (infra)
---
Never enable ACTIONS_ALLOW_UNSECURE_COMMANDS.

## Bad
~~~~
  ACTIONS_ALLOW_UNSECURE_COMMANDS: true
~~~~

## Good
~~~~
  CI: true
~~~~
