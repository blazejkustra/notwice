---
kind: forbid
pattern: '^\s*from\s+__future__\s+import\s+(?:print_function|unicode_literals|division|absolute_import)'
targets: [files]
paths: ['*.py']
severity: block
from: benchmark distractor (language)
---
No Python 2 __future__ imports.

## Bad
~~~~
from __future__ import print_function
~~~~

## Good
~~~~
from __future__ import annotations
~~~~
