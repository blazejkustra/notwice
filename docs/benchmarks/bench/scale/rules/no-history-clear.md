---
kind: forbid
pattern: '\bhistory\s+-c\b'
targets: [commands]
severity: block
from: benchmark distractor (commands)
---
Never clear the shell history.

## Bad
~~~~
history -c
~~~~

## Good
~~~~
history | tail -5
~~~~
