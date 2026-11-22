---
kind: forbid
pattern: '\brest assured\b'
flags: i
targets: [commits, pr, comments]
severity: block
from: benchmark distractor (writing)
---
Do not write "rest assured" in commits, PRs or comments; give the evidence.

## Bad
~~~~
rest assured
~~~~

## Good
~~~~
Update the uploader retry logic.
~~~~
