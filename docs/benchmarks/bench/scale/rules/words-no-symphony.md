---
kind: forbid
pattern: '\ba symphony of\b'
flags: i
targets: [commits, pr, comments]
severity: block
from: benchmark distractor (writing)
---
Cut "a symphony of" from anything posted to GitHub; list the parts.

## Bad
~~~~
a symphony of
~~~~

## Good
~~~~
Update the uploader retry logic.
~~~~
