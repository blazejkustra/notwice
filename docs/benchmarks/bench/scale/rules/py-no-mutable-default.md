---
kind: forbid
pattern: 'def\s+\w+\([^)]*=\s*(?:\[\]|\{\}|set\(\)|dict\(\)|list\(\))'
targets: [files]
paths: ['*.py']
severity: block
from: benchmark distractor (language)
---
No mutable default arguments; default to None.

## Bad
~~~~
def add(item, items=[]):
~~~~

## Good
~~~~
def add(item, items=None):
~~~~
