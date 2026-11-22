---
kind: forbid
pattern: '\bgrandfather(?:ed|ing)\b'
flags: i
targets: [files, commits, pr, comments]
paths: ['*.{md,mdx,txt}']
severity: block
from: benchmark distractor (writing)
---
"grandfathered" is banned in commit messages and PR text: say legacy or exempt.

## Bad
~~~~
grandfathered
~~~~

## Good
~~~~
Update the uploader retry logic.
~~~~
