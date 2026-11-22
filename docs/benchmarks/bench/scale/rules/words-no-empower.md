---
kind: forbid
pattern: '\bempower(?:s|ed|ing)?\b'
flags: i
targets: [commits, pr, comments]
severity: block
from: benchmark distractor (writing)
---
"empower" is banned in commit messages and PR text: say let or allow.

## Bad
~~~~
empower
~~~~

## Good
~~~~
Update the uploader retry logic.
~~~~
