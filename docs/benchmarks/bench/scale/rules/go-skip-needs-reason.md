---
kind: forbid
pattern: '\bt\.Skip\(\s*\)'
targets: [files]
paths: ['*_test.go']
severity: block
from: benchmark distractor (language)
---
t.Skip needs a reason.

## Bad
~~~~
t.Skip()
~~~~

## Good
~~~~
t.Skip("needs docker; run with -tags integration")
~~~~
