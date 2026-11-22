---
kind: forbid
pattern: '\bparamount\b'
flags: i
targets: [commits, pr, comments]
severity: block
from: benchmark distractor (writing)
---
Cut "paramount" from anything posted to GitHub; say what depends on it.

## Bad
~~~~
paramount
~~~~

## Good
~~~~
Update the uploader retry logic.
~~~~
