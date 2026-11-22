---
kind: forbid
pattern: '\bpulumi\s+destroy\b'
targets: [commands]
severity: block
from: benchmark distractor (commands)
---
Never run pulumi destroy.

## Bad
~~~~
pulumi destroy --yes
~~~~

## Good
~~~~
pulumi preview
~~~~
