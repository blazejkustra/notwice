---
kind: forbid
pattern: '\bcircle back\b'
flags: i
targets: [commits, pr, comments]
severity: block
from: benchmark distractor (writing)
---
Cut "circle back" from anything posted to GitHub; say when you will follow up.

## Bad
~~~~
circle back
~~~~

## Good
~~~~
Update the uploader retry logic.
~~~~
