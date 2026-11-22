---
kind: forbid
pattern: '\bxcrun\s+simctl\s+erase\s+all\b'
targets: [commands]
severity: block
from: benchmark distractor (commands)
---
Do not erase every simulator.

## Bad
~~~~
xcrun simctl erase all
~~~~

## Good
~~~~
xcrun simctl erase "iPhone 17"
~~~~
