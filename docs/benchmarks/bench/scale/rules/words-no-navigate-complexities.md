---
kind: forbid
pattern: '\bnavigat(?:e|ing) the complexities\b'
flags: i
targets: [commits, pr, comments]
severity: block
from: benchmark distractor (writing)
---
"navigate the complexities" is banned in commit messages and PR text: name the problem.

## Bad
~~~~
navigate the complexities
~~~~

## Good
~~~~
Update the uploader retry logic.
~~~~
