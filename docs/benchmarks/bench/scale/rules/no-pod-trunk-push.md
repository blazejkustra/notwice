---
kind: forbid
pattern: '\bpod\s+trunk\s+push\b'
targets: [commands]
severity: block
from: benchmark distractor (commands)
---
Only the release workflow pushes pods.

## Bad
~~~~
pod trunk push App.podspec
~~~~

## Good
~~~~
pod lib lint App.podspec
~~~~
