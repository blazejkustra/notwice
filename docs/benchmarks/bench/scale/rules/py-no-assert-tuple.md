---
kind: forbid
pattern: '^\s*assert\s*\('
targets: [files]
paths: ['*.py']
severity: block
from: benchmark distractor (language)
---
assert with a tuple is always true; drop the parentheses.

## Bad
~~~~
assert (x > 0, "x must be positive")
~~~~

## Good
~~~~
assert x > 0, "x must be positive"
~~~~
