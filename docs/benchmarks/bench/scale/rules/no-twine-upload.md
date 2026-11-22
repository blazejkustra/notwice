---
kind: forbid
pattern: '\btwine\s+upload\b'
targets: [commands]
severity: block
from: benchmark distractor (commands)
---
Only the release workflow uploads to PyPI.

## Bad
~~~~
twine upload dist/*
~~~~

## Good
~~~~
twine check dist/*
~~~~
