---
kind: forbid
pattern: '^(?:max|min|default)_[a-z_]+\s*=\s*\d'
targets: [files]
paths: ['*.py']
severity: block
from: benchmark distractor (naming)
---
Module constants are UPPER_SNAKE_CASE.

## Bad
~~~~
max_retries = 3
~~~~

## Good
~~~~
MAX_RETRIES = 3
~~~~
