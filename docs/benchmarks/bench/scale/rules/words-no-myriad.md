---
kind: forbid
pattern: '\ba myriad of\b'
flags: i
targets: [commits, pr, comments]
severity: block
from: benchmark distractor (writing)
---
Cut "a myriad of" from anything posted to GitHub; give the number.

## Bad
~~~~
a myriad of
~~~~

## Good
~~~~
Update the uploader retry logic.
~~~~
