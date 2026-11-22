---
kind: forbid
pattern: '\bdocker\s+run\b[^;&|\n]*\s--privileged\b'
targets: [commands]
severity: block
from: benchmark distractor (commands)
---
Never run containers with --privileged.

## Bad
~~~~
docker run --privileged app
~~~~

## Good
~~~~
docker run --cap-add NET_ADMIN app
~~~~
