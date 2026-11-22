---
kind: forbid
pattern: '\bin\s+\w+\.keys\(\)\s*:'
targets: [files]
paths: ['*.py']
severity: block
from: benchmark distractor (language)
---
Iterate the dict directly, not dict.keys().

## Bad
~~~~
for key in config.keys():
~~~~

## Good
~~~~
for key in config:
~~~~
