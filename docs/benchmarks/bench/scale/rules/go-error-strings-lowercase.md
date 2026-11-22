---
kind: forbid
pattern: '(?:errors\.New|fmt\.Errorf)\(\s*"[A-Z][a-z]'
targets: [files]
paths: ['*.go']
severity: block
from: benchmark distractor (naming)
---
Error strings start lowercase.

## Bad
~~~~
return errors.New("Not found")
~~~~

## Good
~~~~
return errors.New("not found")
~~~~
