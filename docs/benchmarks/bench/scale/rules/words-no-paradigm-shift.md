---
kind: forbid
pattern: '\bparadigm[ -]shift\b'
flags: i
targets: [commits, pr, comments]
severity: block
from: benchmark distractor (writing)
---
Cut "paradigm shift" from anything posted to GitHub; describe the change.

## Bad
~~~~
paradigm shift
~~~~

## Good
~~~~
Update the uploader retry logic.
~~~~
