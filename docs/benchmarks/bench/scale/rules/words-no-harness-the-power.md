---
kind: forbid
pattern: '\bharness(?:es|ing)? the power\b'
flags: i
targets: [commits, pr, comments]
severity: block
from: benchmark distractor (writing)
---
Do not write "harness the power" in commits, PRs or comments; say use.

## Bad
~~~~
harness the power
~~~~

## Good
~~~~
Update the uploader retry logic.
~~~~
