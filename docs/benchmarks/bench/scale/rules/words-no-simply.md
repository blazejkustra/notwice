---
kind: forbid
pattern: '\b(?:simply|obviously|clearly)\b'
flags: i
targets: [files]
paths: ['*.{md,mdx,txt}']
severity: block
from: benchmark distractor (writing)
---
Cut "simply, obviously or clearly" from anything posted to GitHub; cut the word.

## Bad
~~~~
simply, obviously or clearly
~~~~

## Good
~~~~
Update the uploader retry logic.
~~~~
