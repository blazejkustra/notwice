---
kind: forbid
pattern: '\bfastlane\s+(?:release|deliver|submit)\b'
targets: [commands]
severity: block
from: benchmark distractor (commands)
---
App Store submission is the user's decision; do not run release lanes.

## Bad
~~~~
fastlane release
~~~~

## Good
~~~~
fastlane beta
~~~~
