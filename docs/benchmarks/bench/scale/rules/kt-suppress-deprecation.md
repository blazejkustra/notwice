---
kind: forbid
pattern: '@Suppress\(\s*"DEPRECATION"\s*\)'
targets: [files]
paths: ['*.{kt,kts}']
severity: block
from: benchmark distractor (language)
---
Do not suppress deprecation warnings; migrate the call.

## Bad
~~~~
@Suppress("DEPRECATION")
~~~~

## Good
~~~~
@RequiresApi(33)
~~~~
