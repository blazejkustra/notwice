---
kind: forbid
pattern: '\bsynerg(?:y|ies|ize)\b'
flags: i
targets: [commits, pr, comments]
severity: block
from: benchmark distractor (writing)
---
"synergy" is banned in commit messages and PR text: say what works together.

## Bad
~~~~
synergy
~~~~

## Good
~~~~
Update the uploader retry logic.
~~~~
