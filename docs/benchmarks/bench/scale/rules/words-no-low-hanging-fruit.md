---
kind: forbid
pattern: '\blow[ -]hanging fruit\b'
flags: i
targets: [commits, pr, comments]
severity: block
from: benchmark distractor (writing)
---
Cut "low-hanging fruit" from anything posted to GitHub; say quick fix.

## Bad
~~~~
low-hanging fruit
~~~~

## Good
~~~~
Update the uploader retry logic.
~~~~
