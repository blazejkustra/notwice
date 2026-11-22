---
kind: forbid
pattern: '\btapestr(?:y|ies)\b'
flags: i
targets: [commits, pr, comments]
severity: block
from: benchmark distractor (writing)
---
"tapestry" is banned in commit messages and PR text: describe the actual parts.

## Bad
~~~~
tapestry
~~~~

## Good
~~~~
Update the uploader retry logic.
~~~~
