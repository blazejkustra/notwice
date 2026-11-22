---
kind: forbid
pattern: '\bnext[ -]level\b'
flags: i
targets: [commits, pr, comments]
severity: block
from: benchmark distractor (writing)
---
"next-level" is banned in commit messages and PR text: say what improved.

## Bad
~~~~
next-level
~~~~

## Good
~~~~
Update the uploader retry logic.
~~~~
