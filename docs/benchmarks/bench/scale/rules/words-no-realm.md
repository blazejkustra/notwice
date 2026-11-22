---
kind: forbid
pattern: '\bin the realm of\b'
flags: i
targets: [commits, pr, comments]
severity: block
from: benchmark distractor (writing)
---
Do not write "in the realm of" in commits, PRs or comments; name the area plainly.

## Bad
~~~~
in the realm of
~~~~

## Good
~~~~
Update the uploader retry logic.
~~~~
