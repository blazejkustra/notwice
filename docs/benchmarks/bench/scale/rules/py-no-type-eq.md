---
kind: forbid
pattern: '\btype\(\w+\)\s*=='
targets: [files]
paths: ['*.py']
severity: block
from: benchmark distractor (language)
---
Use isinstance() instead of comparing type().

## Bad
~~~~
if type(value) == int:
~~~~

## Good
~~~~
if isinstance(value, int):
~~~~
