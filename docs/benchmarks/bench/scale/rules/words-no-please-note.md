---
kind: forbid
pattern: '\bplease note\b'
flags: i
targets: [commits, pr, comments]
severity: block
from: benchmark distractor (writing)
---
"please note" is banned in commit messages and PR text: state the point.

## Bad
~~~~
please note
~~~~

## Good
~~~~
Update the uploader retry logic.
~~~~
