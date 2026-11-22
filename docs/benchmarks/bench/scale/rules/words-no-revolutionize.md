---
kind: forbid
pattern: '\brevolutioni[sz](?:e|es|ed|ing)\b'
flags: i
targets: [commits, pr, comments]
severity: block
from: benchmark distractor (writing)
---
"revolutionize" is banned in commit messages and PR text: say what changed.

## Bad
~~~~
revolutionize
~~~~

## Good
~~~~
Update the uploader retry logic.
~~~~
