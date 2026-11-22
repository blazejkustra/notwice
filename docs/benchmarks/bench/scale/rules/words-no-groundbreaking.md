---
kind: forbid
pattern: '\bgroundbreaking\b'
flags: i
targets: [commits, pr, comments]
severity: block
from: benchmark distractor (writing)
---
Do not write "groundbreaking" in commits, PRs or comments; show the result.

## Bad
~~~~
groundbreaking
~~~~

## Good
~~~~
Update the uploader retry logic.
~~~~
