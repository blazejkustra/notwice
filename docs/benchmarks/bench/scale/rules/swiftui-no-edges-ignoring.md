---
kind: forbid
pattern: '\.edgesIgnoringSafeArea\('
targets: [files]
paths: ['*.swift']
severity: block
from: benchmark distractor (framework)
---
edgesIgnoringSafeArea is deprecated; use ignoresSafeArea.

## Bad
~~~~
.edgesIgnoringSafeArea(.all)
~~~~

## Good
~~~~
.ignoresSafeArea()
~~~~
