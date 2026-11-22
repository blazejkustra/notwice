---
kind: forbid
pattern: '\bunleash(?:es|ed|ing)?\b'
flags: i
targets: [commits, pr, comments]
severity: block
from: benchmark distractor (writing)
---
"unleash" is banned in commit messages and PR text: say enable.

## Bad
~~~~
unleash
~~~~

## Good
~~~~
Update the uploader retry logic.
~~~~
