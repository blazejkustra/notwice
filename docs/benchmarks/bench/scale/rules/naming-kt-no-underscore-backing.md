---
kind: forbid
pattern: 'private\s+val\s+_[a-z]\w*\s*=\s*(?!MutableStateFlow|MutableLiveData|MutableSharedFlow)'
targets: [files]
paths: ['*.{kt,kts}']
severity: block
from: benchmark distractor (naming)
---
Use _name only for backing properties of mutable flows.

## Bad
~~~~
private val _client = HttpClient()
~~~~

## Good
~~~~
private val client = HttpClient()
~~~~
