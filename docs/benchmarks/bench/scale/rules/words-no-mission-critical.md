---
kind: forbid
pattern: '\bmission[ -]critical\b'
flags: i
targets: [commits, pr, comments]
severity: block
from: benchmark distractor (writing)
---
Cut "mission-critical" from anything posted to GitHub; say what breaks without it.

## Bad
~~~~
mission-critical
~~~~

## Good
~~~~
Update the uploader retry logic.
~~~~
