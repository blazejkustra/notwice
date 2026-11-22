---
kind: forbid
pattern: '\bnpm\s+audit\s+fix\s+--force\b'
targets: [commands]
severity: block
from: benchmark distractor (commands)
---
Never run npm audit fix --force; it jumps major versions.

## Bad
~~~~
npm audit fix --force
~~~~

## Good
~~~~
npm audit
~~~~
