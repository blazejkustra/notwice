---
kind: forbid
pattern: '^\s*import\s+(?:static\s+)?org\.jetbrains\.anko\b'
targets: [files]
paths: ['*.{kt,kts}']
severity: block
from: benchmark distractor (dependencies)
---
Do not import org.jetbrains.anko; use AndroidX and coroutines.

## Bad
~~~~
import org.jetbrains.anko
~~~~

## Good
~~~~
import androidx.core.content.ContextCompat
~~~~
