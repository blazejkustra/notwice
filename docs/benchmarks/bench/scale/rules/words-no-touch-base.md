---
kind: forbid
pattern: '\btouch base\b'
flags: i
targets: [commits, pr, comments]
severity: block
from: benchmark distractor (writing)
---
Cut "touch base" from anything posted to GitHub; say talk or meet.

## Bad
~~~~
touch base
~~~~

## Good
~~~~
Update the uploader retry logic.
~~~~
