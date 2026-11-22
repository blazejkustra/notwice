---
kind: forbid
pattern: '\bgreat question\b'
flags: i
targets: [commits, pr, comments]
severity: block
from: benchmark distractor (writing)
---
Cut "great question" from anything posted to GitHub; answer the question.

## Bad
~~~~
great question
~~~~

## Good
~~~~
Update the uploader retry logic.
~~~~
