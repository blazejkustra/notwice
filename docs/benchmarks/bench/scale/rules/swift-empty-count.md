---
kind: forbid
pattern: '\.count\s*==\s*0\b'
targets: [files]
paths: ['*.swift']
severity: block
from: benchmark distractor (language)
---
Use isEmpty instead of count == 0.

## Bad
~~~~
if items.count == 0 { return }
~~~~

## Good
~~~~
if items.isEmpty { return }
~~~~
