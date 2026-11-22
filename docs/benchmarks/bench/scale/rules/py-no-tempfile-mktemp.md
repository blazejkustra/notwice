---
kind: forbid
pattern: '\btempfile\.mktemp\('
targets: [files]
paths: ['*.py']
severity: block
from: benchmark distractor (security)
---
tempfile.mktemp is unsafe; use NamedTemporaryFile or mkstemp.

## Bad
~~~~
path = tempfile.mktemp()
~~~~

## Good
~~~~
fd, path = tempfile.mkstemp()
~~~~
