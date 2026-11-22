---
kind: forbid
pattern: '\.foregroundColor\('
targets: [files]
paths: ['*.swift']
severity: block
from: benchmark distractor (framework)
---
foregroundColor is deprecated; use foregroundStyle.

## Bad
~~~~
.foregroundColor(.red)
~~~~

## Good
~~~~
.foregroundStyle(.red)
~~~~
