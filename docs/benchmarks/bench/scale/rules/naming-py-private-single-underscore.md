---
kind: forbid
pattern: '^\s*def\s+__[a-z]\w*[^_]\('
targets: [files]
paths: ['*.py']
severity: block
from: benchmark distractor (naming)
---
Use a single underscore for private methods; double underscores mangle names.

## Bad
~~~~
def __load(self):
~~~~

## Good
~~~~
def _load(self):
~~~~
