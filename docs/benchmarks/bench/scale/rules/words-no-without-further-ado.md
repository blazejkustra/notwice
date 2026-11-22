---
kind: forbid
pattern: '\bwithout further ado\b'
flags: i
targets: [commits, pr, comments]
severity: block
from: benchmark distractor (writing)
---
"without further ado" is banned in commit messages and PR text: cut it.

## Bad
~~~~
without further ado
~~~~

## Good
~~~~
Update the uploader retry logic.
~~~~
