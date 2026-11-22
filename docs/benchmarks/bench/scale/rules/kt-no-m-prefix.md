---
kind: forbid
pattern: '\b(?:val|var)\s+m[A-Z]\w*'
targets: [files]
paths: ['*.{kt,kts}']
severity: block
from: benchmark distractor (naming)
---
No m prefix on Kotlin properties.

## Bad
~~~~
private var mAdapter: ListAdapter? = null
~~~~

## Good
~~~~
private var adapter: ListAdapter? = null
~~~~
