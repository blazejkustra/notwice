---
kind: forbid
pattern: '\btextScaleFactor\b'
targets: [files]
paths: ['*.dart']
severity: block
from: benchmark distractor (language)
---
textScaleFactor is deprecated; use textScaler.

## Bad
~~~~
textScaleFactor: 1.2
~~~~

## Good
~~~~
textScaler: TextScaler.linear(1.2)
~~~~
