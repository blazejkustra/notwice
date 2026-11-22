---
kind: forbid
pattern: '\.collectAsState\(\)'
targets: [files]
paths: ['*.{kt,kts}']
severity: block
from: benchmark distractor (framework)
---
Use collectAsStateWithLifecycle in Compose UI.

## Bad
~~~~
val state by viewModel.state.collectAsState()
~~~~

## Good
~~~~
val state by viewModel.state.collectAsStateWithLifecycle()
~~~~
