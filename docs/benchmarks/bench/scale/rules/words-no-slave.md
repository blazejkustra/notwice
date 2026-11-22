---
kind: forbid
pattern: '\bslaves?\b'
flags: i
targets: [files, commits, pr, comments]
paths: ['*.{md,mdx,txt}']
severity: block
from: benchmark distractor (writing)
---
"slave" is banned in commit messages and PR text: say replica, follower or worker.

## Bad
~~~~
slave
~~~~

## Good
~~~~
Update the uploader retry logic.
~~~~
