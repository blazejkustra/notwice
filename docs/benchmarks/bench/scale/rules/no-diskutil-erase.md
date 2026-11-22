---
kind: forbid
pattern: '\bdiskutil\s+erase\w*\b'
targets: [commands]
severity: block
from: benchmark distractor (commands)
---
Never erase disks.

## Bad
~~~~
diskutil eraseDisk APFS Data disk2
~~~~

## Good
~~~~
diskutil list
~~~~
