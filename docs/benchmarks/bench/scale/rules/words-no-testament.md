---
kind: forbid
pattern: '\ba testament to\b'
flags: i
targets: [commits, pr, comments]
severity: block
from: benchmark distractor (writing)
---
Cut "a testament to" from anything posted to GitHub; state the fact it proves.

## Bad
~~~~
a testament to
~~~~

## Good
~~~~
Update the uploader retry logic.
~~~~
