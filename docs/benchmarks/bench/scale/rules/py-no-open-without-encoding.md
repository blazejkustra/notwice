---
kind: forbid
pattern: '\bopen\(\s*[^,)]+,\s*[''"][rwa]t?[''"]\s*\)'
targets: [files]
paths: ['*.py']
severity: block
from: benchmark distractor (language)
---
Pass encoding= when opening text files.

## Bad
~~~~
with open(path, "r") as f:
~~~~

## Good
~~~~
with open(path, encoding="utf-8") as f:
~~~~
