---
kind: forbid
pattern: '\braise\s+Exception\('
targets: [files]
paths: ['*.py']
severity: block
from: benchmark distractor (language)
---
Raise a specific exception class, not Exception.

## Bad
~~~~
raise Exception("not found")
~~~~

## Good
~~~~
raise LookupError("not found")
~~~~
