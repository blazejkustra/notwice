---
kind: forbid
pattern: '\bchmod\s+(?:-R\s+)?777\b'
targets: [commands]
severity: block
from: benchmark distractor (commands)
---
Never chmod 777.

## Bad
~~~~
chmod -R 777 storage
~~~~

## Good
~~~~
chmod -R 775 storage
~~~~
