---
kind: forbid
pattern: '\bcrontab\s+-r\b'
targets: [commands]
severity: block
from: benchmark distractor (commands)
---
Never remove the crontab.

## Bad
~~~~
crontab -r
~~~~

## Good
~~~~
crontab -l
~~~~
