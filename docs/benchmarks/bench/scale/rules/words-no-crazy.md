---
kind: forbid
pattern: '\b(?:crazy|insane|insanely)\b'
flags: i
targets: [commits, pr, comments]
severity: block
from: benchmark distractor (writing)
---
Do not write "crazy or insane" in commits, PRs or comments; say surprising or extreme.

## Bad
~~~~
crazy or insane
~~~~

## Good
~~~~
Update the uploader retry logic.
~~~~
