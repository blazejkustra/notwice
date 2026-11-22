---
kind: forbid
pattern: '\bI hope this helps\b'
flags: i
targets: [commits, pr, comments]
severity: block
from: benchmark distractor (writing)
---
Cut "I hope this helps" from anything posted to GitHub; end with the answer.

## Bad
~~~~
I hope this helps
~~~~

## Good
~~~~
Update the uploader retry logic.
~~~~
