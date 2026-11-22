---
kind: forbid
pattern: '\bfmt\.Print'
targets: [files]
paths: ['*_test.go']
severity: block
from: benchmark distractor (testing)
---
Use t.Log instead of fmt.Print in tests.

## Bad
~~~~
fmt.Println(got)
~~~~

## Good
~~~~
t.Logf("got %v", got)
~~~~
