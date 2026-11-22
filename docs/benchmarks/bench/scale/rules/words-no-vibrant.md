---
kind: forbid
pattern: '\bvibrant\b'
flags: i
targets: [commits, pr, comments]
severity: block
from: benchmark distractor (writing)
---
Do not write "vibrant" in commits, PRs or comments; describe it concretely.

## Bad
~~~~
vibrant
~~~~

## Good
~~~~
Update the uploader retry logic.
~~~~
