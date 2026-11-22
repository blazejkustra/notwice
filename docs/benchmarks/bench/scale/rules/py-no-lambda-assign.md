---
kind: forbid
pattern: '^\s*\w+\s*=\s*lambda\b'
targets: [files]
paths: ['*.py']
severity: block
from: benchmark distractor (language)
---
Do not assign lambdas; write a def.

## Bad
~~~~
square = lambda x: x * x
~~~~

## Good
~~~~
def square(x): return x * x
~~~~
