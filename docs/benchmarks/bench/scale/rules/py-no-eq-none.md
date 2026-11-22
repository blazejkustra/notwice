---
kind: forbid
pattern: '[=!]=\s*None\b'
targets: [files]
paths: ['*.py']
severity: block
from: benchmark distractor (language)
---
Compare with None using is or is not.

## Bad
~~~~
if user == None:
~~~~

## Good
~~~~
if user is None:
~~~~
