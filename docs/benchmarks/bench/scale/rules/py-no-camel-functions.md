---
kind: forbid
pattern: '^\s*def\s+[a-z]+[A-Z]\w*\('
targets: [files]
paths: ['*.py']
severity: block
from: benchmark distractor (naming)
---
Python function names are snake_case.

## Bad
~~~~
def getUser(user_id):
~~~~

## Good
~~~~
def get_user(user_id):
~~~~
