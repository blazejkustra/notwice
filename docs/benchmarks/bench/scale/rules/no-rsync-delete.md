---
kind: forbid
pattern: '\brsync\b[^;&|\n]*\s--delete\b'
targets: [commands]
severity: block
from: benchmark distractor (commands)
---
Do not rsync with --delete from a session.

## Bad
~~~~
rsync -av --delete build/ server:/srv/www
~~~~

## Good
~~~~
rsync -av build/ server:/srv/www
~~~~
