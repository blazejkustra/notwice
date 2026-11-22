---
kind: forbid
pattern: '\b(?:pkill|killall)\s+(?:-9\s+)?(?:node|Simulator|Xcode|Finder|Dock)\b'
targets: [commands]
severity: block
from: benchmark distractor (commands)
---
Do not kill every process by name; kill the PID you started.

## Bad
~~~~
killall node
~~~~

## Good
~~~~
kill "$SERVER_PID"
~~~~
