---
kind: forbid
pattern: '^\s*global\s+\w'
targets: [files]
paths: ['*.py']
severity: block
from: benchmark distractor (language)
---
Do not use global; pass state explicitly.

## Bad
~~~~
global cache
~~~~

## Good
~~~~
cache = load_cache()
~~~~
