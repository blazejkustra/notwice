---
kind: forbid
pattern: '\bM_PI\b'
targets: [files]
paths: ['*.swift']
severity: block
from: benchmark distractor (language)
---
Use .pi instead of M_PI.

## Bad
~~~~
let angle = CGFloat(M_PI) / 2
~~~~

## Good
~~~~
let angle = CGFloat.pi / 2
~~~~
