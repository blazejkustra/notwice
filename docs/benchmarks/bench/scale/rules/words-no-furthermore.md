---
kind: forbid
pattern: '^(?:Furthermore|Moreover|Additionally),'
flags: i
targets: [commits, pr, comments]
severity: block
from: benchmark distractor (writing)
---
Do not write "Furthermore," in commits, PRs or comments; start the sentence with the point.

## Bad
~~~~
Furthermore,
~~~~

## Good
~~~~
Update the uploader retry logic.
~~~~
