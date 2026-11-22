---
kind: forbid
pattern: '\b(?:ninja|rockstar|guru)s?\b'
flags: i
targets: [commits, pr, comments]
severity: block
from: benchmark distractor (writing)
---
Cut "ninja, rockstar or guru" from anything posted to GitHub; say expert.

## Bad
~~~~
ninja, rockstar or guru
~~~~

## Good
~~~~
Update the uploader retry logic.
~~~~
