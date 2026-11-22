---
kind: forbid
pattern: '\bembark(?:s|ed|ing)? on\b'
flags: i
targets: [commits, pr, comments]
severity: block
from: benchmark distractor (writing)
---
Do not write "embark on" in commits, PRs or comments; say start.

## Bad
~~~~
embark on
~~~~

## Good
~~~~
Update the uploader retry logic.
~~~~
