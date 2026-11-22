---
kind: forbid
pattern: '\bdumb\b'
flags: i
targets: [files, commits, pr, comments]
paths: ['*.{md,mdx,txt}']
severity: block
from: benchmark distractor (writing)
---
Cut "dumb" from anything posted to GitHub; say simple or naive.

## Bad
~~~~
dumb
~~~~

## Good
~~~~
Update the uploader retry logic.
~~~~
