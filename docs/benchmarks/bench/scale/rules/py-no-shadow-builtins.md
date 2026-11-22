---
kind: forbid
pattern: '^\s*(?:list|dict|str|id|type|input|filter|map|max|min|sum|len)\s*=\s*'
targets: [files]
paths: ['*.py']
severity: block
from: benchmark distractor (language)
---
Do not shadow built-in names.

## Bad
~~~~
list = get_items()
~~~~

## Good
~~~~
items = get_items()
~~~~
