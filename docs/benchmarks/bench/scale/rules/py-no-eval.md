---
kind: forbid
pattern: '(?<![\w.])eval\('
targets: [files]
paths: ['*.py']
severity: block
from: benchmark distractor (security)
---
Never use eval(); use ast.literal_eval for literals.

## Bad
~~~~
config = eval(text)
~~~~

## Good
~~~~
config = ast.literal_eval(text)
~~~~
