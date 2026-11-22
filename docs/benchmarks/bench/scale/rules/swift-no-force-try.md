---
kind: forbid
pattern: '\btry!\s'
targets: [files]
paths: ['*.swift']
severity: block
from: benchmark distractor (language)
---
No try!; handle the error or propagate it.

## Bad
~~~~
let data = try! Data(contentsOf: url)
~~~~

## Good
~~~~
let data = try Data(contentsOf: url)
~~~~
