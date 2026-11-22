---
kind: forbid
pattern: '\bshowcas(?:e|es|ed|ing)\b'
flags: i
targets: [commits, pr, comments]
severity: block
from: benchmark distractor (writing)
---
Cut "showcase" from anything posted to GitHub; say show.

## Bad
~~~~
showcase
~~~~

## Good
~~~~
Update the uploader retry logic.
~~~~
