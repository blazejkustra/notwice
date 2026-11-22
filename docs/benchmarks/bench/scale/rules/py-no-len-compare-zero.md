---
kind: forbid
pattern: '\blen\([^)]+\)\s*(?:==|>|!=)\s*0\b'
targets: [files]
paths: ['*.py']
severity: block
from: benchmark distractor (language)
---
Test emptiness with the value itself, not len(x) == 0.

## Bad
~~~~
if len(items) == 0:
~~~~

## Good
~~~~
if not items:
~~~~
