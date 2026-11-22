---
kind: forbid
pattern: '\bgame[ -]?changer\b'
flags: i
targets: [commits, pr, comments]
severity: block
from: benchmark distractor (writing)
---
Do not write "game changer" in commits, PRs or comments; state the effect with a number.

## Bad
~~~~
game changer
~~~~

## Good
~~~~
Update the uploader retry logic.
~~~~
