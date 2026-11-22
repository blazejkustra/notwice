---
kind: forbid
pattern: 'MODE_WORLD_(?:READABLE|WRITEABLE)'
targets: [files]
paths: ['*.{kt,kts}']
severity: block
from: benchmark distractor (framework)
---
Never create world-readable files.

## Bad
~~~~
openFileOutput("x", MODE_WORLD_READABLE)
~~~~

## Good
~~~~
openFileOutput("x", Context.MODE_PRIVATE)
~~~~
