---
kind: forbid
pattern: '\bchmod\s+(?:-R\s+)?777\b'
targets: [files]
paths: ['*.{sh,bash,zsh}']
severity: block
from: benchmark distractor (security)
---
Never chmod 777.

## Bad
~~~~
chmod 777 uploads
~~~~

## Good
~~~~
chmod 750 uploads
~~~~
