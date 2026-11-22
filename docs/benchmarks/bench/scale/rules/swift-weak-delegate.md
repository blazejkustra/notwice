---
kind: forbid
pattern: '^\s*(?:public\s+|internal\s+|private\s+)?var\s+delegate\s*:'
targets: [files]
paths: ['*.swift']
severity: block
from: benchmark distractor (language)
---
Delegates must be weak to avoid retain cycles.

## Bad
~~~~
var delegate: ListDelegate?
~~~~

## Good
~~~~
weak var delegate: ListDelegate?
~~~~
