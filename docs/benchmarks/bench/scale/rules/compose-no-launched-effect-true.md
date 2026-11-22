---
kind: forbid
pattern: 'LaunchedEffect\(\s*true\s*\)'
targets: [files]
paths: ['*.{kt,kts}']
severity: block
from: benchmark distractor (framework)
---
Key LaunchedEffect on real inputs, or Unit, never true.

## Bad
~~~~
LaunchedEffect(true) { load() }
~~~~

## Good
~~~~
LaunchedEffect(userId) { load(userId) }
~~~~
