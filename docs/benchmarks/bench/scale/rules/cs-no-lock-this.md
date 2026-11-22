---
kind: forbid
pattern: '\block\s*\(\s*(?:this|typeof\()'
targets: [files]
paths: ['*.cs']
severity: block
from: benchmark distractor (language)
---
Never lock on this or a type; lock on a private object.

## Bad
~~~~
lock (this) {
~~~~

## Good
~~~~
lock (_gate) {
~~~~
