---
kind: forbid
pattern: '\bmkfs(?:\.\w+)?\s'
targets: [commands]
severity: block
from: benchmark distractor (commands)
---
Never format disks.

## Bad
~~~~
mkfs.ext4 /dev/sdb1
~~~~

## Good
~~~~
lsblk
~~~~
