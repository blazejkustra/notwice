---
kind: forbid
pattern: '\bTODO\(\s*\)'
targets: [files]
paths: ['*.{kt,kts}']
severity: block
from: benchmark distractor (language)
---
Do not ship TODO() calls; they throw at runtime.

## Bad
~~~~
override fun refresh() = TODO()
~~~~

## Good
~~~~
override fun refresh() = repository.refresh()
~~~~
