---
kind: forbid
pattern: '\bplethora\b'
flags: i
targets: [commits, pr, comments]
severity: block
from: benchmark distractor (writing)
---
Cut "plethora" from anything posted to GitHub; give the number.

## Bad
~~~~
plethora
~~~~

## Good
~~~~
Update the uploader retry logic.
~~~~
