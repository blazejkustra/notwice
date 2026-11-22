---
kind: forbid
pattern: '\bfatalError\(\s*\)'
targets: [files]
paths: ['Sources/**/*.swift']
severity: block
from: benchmark distractor (language)
---
fatalError() needs a message that explains the broken invariant.

## Bad
~~~~
default: fatalError()
~~~~

## Good
~~~~
default: fatalError("unknown cell kind \(kind)")
~~~~
