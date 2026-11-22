---
kind: forbid
pattern: '\bcrippl(?:e|es|ed|ing)\b'
flags: i
targets: [files, commits, pr, comments]
paths: ['*.{md,mdx,txt}']
severity: block
from: benchmark distractor (writing)
---
Do not write "cripple" in commits, PRs or comments; say break or slow down.

## Bad
~~~~
cripple
~~~~

## Good
~~~~
Update the uploader retry logic.
~~~~
