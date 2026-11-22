---
kind: forbid
pattern: '\bGlobalScope\.(?:launch|async)\b'
targets: [files]
paths: ['*.{kt,kts}']
severity: block
from: benchmark distractor (language)
---
Never use GlobalScope; launch in a lifecycle-bound scope.

## Bad
~~~~
GlobalScope.launch { sync() }
~~~~

## Good
~~~~
viewModelScope.launch { sync() }
~~~~
