---
kind: forbid
pattern: '^\s*from\s+typing\s+import\s+.*\b(?:List|Dict|Tuple|Set|FrozenSet)\b'
targets: [files]
paths: ['*.py']
severity: block
from: benchmark distractor (language)
---
Use built-in generics (list[str]) instead of typing.List.

## Bad
~~~~
from typing import List, Dict
~~~~

## Good
~~~~
from collections.abc import Iterable
~~~~
