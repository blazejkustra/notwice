---
kind: forbid
pattern: '\bkindly\b'
flags: i
targets: [commits, pr, comments]
severity: block
from: benchmark distractor (writing)
---
"kindly" is banned in commit messages and PR text: say please or cut it.

## Bad
~~~~
kindly
~~~~

## Good
~~~~
Update the uploader retry logic.
~~~~
