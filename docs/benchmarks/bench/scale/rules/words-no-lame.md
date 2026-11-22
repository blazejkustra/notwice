---
kind: forbid
pattern: '\blame\b'
flags: i
targets: [commits, pr, comments]
severity: block
from: benchmark distractor (writing)
---
Cut "lame" from anything posted to GitHub; say weak or poor.

## Bad
~~~~
lame
~~~~

## Good
~~~~
Update the uploader retry logic.
~~~~
