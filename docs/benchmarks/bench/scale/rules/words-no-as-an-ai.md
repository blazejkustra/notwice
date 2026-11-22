---
kind: forbid
pattern: '\bas an AI(?: language model)?\b'
flags: i
targets: [commits, pr, comments]
severity: block
from: benchmark distractor (writing)
---
Cut "as an AI" from anything posted to GitHub; cut it.

## Bad
~~~~
as an AI
~~~~

## Good
~~~~
Update the uploader retry logic.
~~~~
