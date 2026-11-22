---
kind: forbid
pattern: '\bhelm\s+(?:uninstall|delete)\b'
targets: [commands]
severity: block
from: benchmark distractor (commands)
---
Ask before uninstalling Helm releases.

## Bad
~~~~
helm uninstall api
~~~~

## Good
~~~~
helm status api
~~~~
