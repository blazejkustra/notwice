---
kind: forbid
pattern: '\bTODO\b'
targets: [pr]
severity: block
from: benchmark distractor (git)
---
No TODOs in PR bodies; open an issue and link it.

## Bad
~~~~
TODO: add tests later
~~~~

## Good
~~~~
Tests cover the retry path.
~~~~
