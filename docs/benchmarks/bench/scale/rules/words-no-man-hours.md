---
kind: forbid
pattern: '\bman[ -]?(?:hours|days|power)\b'
flags: i
targets: [files, commits, pr, comments]
paths: ['*.{md,mdx,txt}']
severity: block
from: benchmark distractor (writing)
---
"man-hours" is banned in commit messages and PR text: say person-hours or staff.

## Bad
~~~~
man-hours
~~~~

## Good
~~~~
Update the uploader retry logic.
~~~~
