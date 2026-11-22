---
kind: forbid
pattern: '\bHandler\(\s*\)'
targets: [files]
paths: ['*.{kt,kts}']
severity: block
from: benchmark distractor (framework)
---
Handler() without a Looper is deprecated.

## Bad
~~~~
val handler = Handler()
~~~~

## Good
~~~~
val handler = Handler(Looper.getMainLooper())
~~~~
