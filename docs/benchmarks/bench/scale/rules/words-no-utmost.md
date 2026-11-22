---
kind: forbid
pattern: '\butmost\b'
flags: i
targets: [commits, pr, comments]
severity: block
from: benchmark distractor (writing)
---
"utmost" is banned in commit messages and PR text: cut it.

## Bad
~~~~
utmost
~~~~

## Good
~~~~
Update the uploader retry logic.
~~~~
