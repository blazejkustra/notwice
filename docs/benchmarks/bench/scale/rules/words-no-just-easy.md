---
kind: forbid
pattern: '\bit''?s (?:easy|trivial)\b'
flags: i
targets: [files]
paths: ['*.{md,mdx,txt}']
severity: block
from: benchmark distractor (writing)
---
"it's easy" is banned in commit messages and PR text: show the steps.

## Bad
~~~~
it's easy
~~~~

## Good
~~~~
Update the uploader retry logic.
~~~~
