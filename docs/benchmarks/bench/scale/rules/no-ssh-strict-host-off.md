---
kind: forbid
pattern: 'StrictHostKeyChecking=no'
targets: [commands]
severity: block
from: benchmark distractor (commands)
---
Never turn off SSH host key checking.

## Bad
~~~~
ssh -o StrictHostKeyChecking=no deploy@host
~~~~

## Good
~~~~
ssh deploy@host
~~~~
