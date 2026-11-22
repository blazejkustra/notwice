---
kind: forbid
pattern: '\[(?:skip ci|ci skip|no ci)\]'
flags: i
targets: [commits]
severity: block
from: benchmark distractor (git)
---
Never skip CI in commit messages.

## Bad
~~~~
Bump version [skip ci]
~~~~

## Good
~~~~
Bump version to 1.4.1
~~~~
