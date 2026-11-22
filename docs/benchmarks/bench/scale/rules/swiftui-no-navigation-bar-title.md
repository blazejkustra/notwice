---
kind: forbid
pattern: '\.navigationBarTitle\('
targets: [files]
paths: ['*.swift']
severity: block
from: benchmark distractor (framework)
---
navigationBarTitle is deprecated; use navigationTitle.

## Bad
~~~~
.navigationBarTitle("Settings")
~~~~

## Good
~~~~
.navigationTitle("Settings")
~~~~
