---
kind: forbid
pattern: '\braw_input\('
targets: [files]
paths: ['*.py']
severity: block
from: benchmark distractor (language)
---
raw_input is Python 2; use input().

## Bad
~~~~
name = raw_input("Name: ")
~~~~

## Good
~~~~
name = input("Name: ")
~~~~
