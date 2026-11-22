---
kind: forbid
pattern: '\bfly(?:ctl)?\s+deploy\b'
targets: [commands]
severity: block
from: benchmark distractor (commands)
---
Production deploys go through CI, not fly deploy.

## Bad
~~~~
fly deploy
~~~~

## Good
~~~~
fly status
~~~~
