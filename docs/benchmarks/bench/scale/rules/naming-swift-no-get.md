---
kind: forbid
pattern: '\bfunc\s+get[A-Z]\w*\(\)\s*->'
targets: [files]
paths: ['*.swift']
severity: block
from: benchmark distractor (naming)
---
Swift getters are properties, not getX() functions.

## Bad
~~~~
func getName() -> String {
~~~~

## Good
~~~~
var name: String {
~~~~
