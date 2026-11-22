---
kind: forbid
pattern: '\bdocker\s+system\s+prune\b[^;&|\n]*\s-a\b'
targets: [commands]
severity: block
from: benchmark distractor (commands)
---
Never docker system prune -a; it deletes every image.

## Bad
~~~~
docker system prune -a -f
~~~~

## Good
~~~~
docker image prune -f
~~~~
