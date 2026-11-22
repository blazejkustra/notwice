---
kind: forbid
pattern: '[=!]=\s*(?:True|False)\b'
targets: [files]
paths: ['*.py']
severity: block
from: benchmark distractor (language)
---
Do not compare with True or False; use the value.

## Bad
~~~~
if enabled == True:
~~~~

## Good
~~~~
if enabled:
~~~~
