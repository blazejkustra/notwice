---
kind: forbid
pattern: '#\s*type:\s*ignore(?!\[)'
targets: [files]
paths: ['*.py']
severity: block
from: benchmark distractor (language)
---
# type: ignore must name the error code.

## Bad
~~~~
value = load()  # type: ignore
~~~~

## Good
~~~~
value = load()  # type: ignore[no-untyped-call]
~~~~
