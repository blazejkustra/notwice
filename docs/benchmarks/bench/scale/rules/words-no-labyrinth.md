---
kind: forbid
pattern: '\blabyrinth(?:ine)?\b'
flags: i
targets: [commits, pr, comments]
severity: block
from: benchmark distractor (writing)
---
"labyrinth" is banned in commit messages and PR text: say complex and explain why.

## Bad
~~~~
labyrinth
~~~~

## Good
~~~~
Update the uploader retry logic.
~~~~
