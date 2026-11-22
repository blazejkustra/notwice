---
kind: forbid
pattern: '\binterface\{\}'
targets: [files]
paths: ['*.go']
severity: block
from: benchmark distractor (language)
---
Write any instead of interface{}.

## Bad
~~~~
func Print(v interface{}) {}
~~~~

## Good
~~~~
func Print(v any) {}
~~~~
