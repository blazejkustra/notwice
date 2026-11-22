---
kind: forbid
pattern: '(?:errors\.New|fmt\.Errorf)\(\s*"[^"]*[.!]"'
targets: [files]
paths: ['*.go']
severity: block
from: benchmark distractor (language)
---
Error strings do not end with punctuation.

## Bad
~~~~
return errors.New("not found.")
~~~~

## Good
~~~~
return errors.New("not found")
~~~~
