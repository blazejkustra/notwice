---
kind: forbid
pattern: '\bgh\s+release\s+delete\b'
targets: [commands]
severity: block
from: benchmark distractor (commands)
---
Never delete GitHub releases.

## Bad
~~~~
gh release delete v1.0.0
~~~~

## Good
~~~~
gh release view v1.0.0
~~~~
