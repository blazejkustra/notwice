---
kind: forbid
pattern: '\bat the end of the day\b'
flags: i
targets: [commits, pr, comments]
severity: block
from: benchmark distractor (writing)
---
Do not write "at the end of the day" in commits, PRs or comments; cut the filler.

## Bad
~~~~
at the end of the day
~~~~

## Good
~~~~
Update the uploader retry logic.
~~~~
