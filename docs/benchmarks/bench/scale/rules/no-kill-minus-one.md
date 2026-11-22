---
kind: forbid
pattern: '\bkill\s+-9\s+-1\b'
targets: [commands]
severity: block
from: benchmark distractor (commands)
---
Never kill -9 -1.

## Bad
~~~~
kill -9 -1
~~~~

## Good
~~~~
kill -TERM "$PID"
~~~~
