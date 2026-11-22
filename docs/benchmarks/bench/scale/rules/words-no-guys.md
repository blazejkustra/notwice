---
kind: forbid
pattern: '\bhey guys\b|\bthanks guys\b|\byou guys\b'
flags: i
targets: [commits, pr, comments]
severity: block
from: benchmark distractor (writing)
---
"thanks guys" is banned in commit messages and PR text: say everyone or folks.

## Bad
~~~~
thanks guys
~~~~

## Good
~~~~
Update the uploader retry logic.
~~~~
