---
kind: forbid
pattern: '^\s*class\s+[a-z]\w*\s*[(:]'
targets: [files]
paths: ['*.py']
severity: block
from: benchmark distractor (naming)
---
Python class names are PascalCase.

## Bad
~~~~
class user_service:
~~~~

## Good
~~~~
class UserService:
~~~~
