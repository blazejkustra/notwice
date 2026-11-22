---
kind: forbid
pattern: '\bdeep[ -]dive\b'
flags: i
targets: [commits, pr, comments]
severity: block
from: benchmark distractor (writing)
---
Do not write "deep dive" in commits, PRs or comments; say analysis or review.

## Bad
~~~~
deep dive
~~~~

## Good
~~~~
Update the uploader retry logic.
~~~~
