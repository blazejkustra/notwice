---
kind: forbid
pattern: '^\s*assert\s'
targets: [files]
paths: ['src/**/*.py', 'app/**/*.py', 'lib/**/*.py']
severity: block
from: benchmark distractor (language)
---
Do not use assert for runtime checks in library code; raise an exception.

## Bad
~~~~
assert user is not None
~~~~

## Good
~~~~
if user is None: raise ValueError("user required")
~~~~
