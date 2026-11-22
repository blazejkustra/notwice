---
kind: forbid
pattern: '\ba beacon of\b'
flags: i
targets: [commits, pr, comments]
severity: block
from: benchmark distractor (writing)
---
Cut "a beacon of" from anything posted to GitHub; state the claim directly.

## Bad
~~~~
a beacon of
~~~~

## Good
~~~~
Update the uploader retry logic.
~~~~
