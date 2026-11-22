---
kind: forbid
pattern: '\bmove the needle\b'
flags: i
targets: [commits, pr, comments]
severity: block
from: benchmark distractor (writing)
---
Do not write "move the needle" in commits, PRs or comments; give the metric.

## Bad
~~~~
move the needle
~~~~

## Good
~~~~
Update the uploader retry logic.
~~~~
