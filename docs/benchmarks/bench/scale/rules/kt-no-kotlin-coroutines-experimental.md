---
kind: forbid
pattern: '^\s*import\s+(?:static\s+)?kotlin\.coroutines\.experimental\b'
targets: [files]
paths: ['*.{kt,kts}']
severity: block
from: benchmark distractor (dependencies)
---
kotlin.coroutines.experimental is banned in this codebase. Use kotlin.coroutines instead.

## Bad
~~~~
import kotlin.coroutines.experimental
~~~~

## Good
~~~~
import kotlin.coroutines.CoroutineContext
~~~~
