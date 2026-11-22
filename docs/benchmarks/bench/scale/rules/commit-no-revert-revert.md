---
kind: forbid
pattern: '^Revert "Revert "'
targets: [commits]
severity: block
from: benchmark distractor (git)
---
Do not revert a revert; reapply the change with a new message.

## Bad
~~~~
Revert "Revert "Add caching""
~~~~

## Good
~~~~
Reapply caching with the TTL fix
~~~~
