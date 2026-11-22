---
kind: forbid
pattern: '\bendeavou?r(?:s)?\b'
flags: i
targets: [commits, pr, comments]
severity: block
from: benchmark distractor (writing)
---
"endeavor" is banned in commit messages and PR text: say try or work.

## Bad
~~~~
endeavor
~~~~

## Good
~~~~
Update the uploader retry logic.
~~~~
