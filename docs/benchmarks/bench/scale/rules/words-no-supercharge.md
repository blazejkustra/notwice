---
kind: forbid
pattern: '\bsupercharg(?:e|es|ed|ing)\b'
flags: i
targets: [commits, pr, comments]
severity: block
from: benchmark distractor (writing)
---
"supercharge" is banned in commit messages and PR text: give the speedup.

## Bad
~~~~
supercharge
~~~~

## Good
~~~~
Update the uploader retry logic.
~~~~
