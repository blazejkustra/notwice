---
kind: forbid
pattern: '\b(?:scp|rsync)\b[^;&|\n]*\b(?:prod|production)[\w.-]*:'
targets: [commands]
severity: block
from: benchmark distractor (commands)
---
Never copy files to production hosts by hand.

## Bad
~~~~
scp build.tar deploy@prod-1:/srv/app
~~~~

## Good
~~~~
scp build.tar deploy@staging-1:/srv/app
~~~~
