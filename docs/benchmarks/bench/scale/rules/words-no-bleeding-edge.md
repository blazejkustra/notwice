---
kind: forbid
pattern: '\b(?:bleeding|cutting)[ -]edge\b'
flags: i
targets: [commits, pr, comments]
severity: block
from: benchmark distractor (writing)
---
"cutting-edge" is banned in commit messages and PR text: name the version or feature.

## Bad
~~~~
cutting-edge
~~~~

## Good
~~~~
Update the uploader retry logic.
~~~~
