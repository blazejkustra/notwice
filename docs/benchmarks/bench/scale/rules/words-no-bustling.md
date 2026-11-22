---
kind: forbid
pattern: '\bbustling\b'
flags: i
targets: [commits, pr, comments]
severity: block
from: benchmark distractor (writing)
---
Cut "bustling" from anything posted to GitHub; cut it.

## Bad
~~~~
bustling
~~~~

## Good
~~~~
Update the uploader retry logic.
~~~~
