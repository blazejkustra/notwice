---
kind: forbid
pattern: '\bstate[ -]of[ -]the[ -]art\b'
flags: i
targets: [commits, pr, comments]
severity: block
from: benchmark distractor (writing)
---
"state-of-the-art" is banned in commit messages and PR text: name the technique.

## Bad
~~~~
state-of-the-art
~~~~

## Good
~~~~
Update the uploader retry logic.
~~~~
