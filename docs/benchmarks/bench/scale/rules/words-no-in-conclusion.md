---
kind: forbid
pattern: '^In conclusion\b'
flags: i
targets: [commits, pr, comments]
severity: block
from: benchmark distractor (writing)
---
Cut "In conclusion" from anything posted to GitHub; just conclude.

## Bad
~~~~
In conclusion
~~~~

## Good
~~~~
Update the uploader retry logic.
~~~~
