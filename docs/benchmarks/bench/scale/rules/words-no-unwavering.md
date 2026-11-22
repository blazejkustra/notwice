---
kind: forbid
pattern: '\bunwavering\b'
flags: i
targets: [commits, pr, comments]
severity: block
from: benchmark distractor (writing)
---
Do not write "unwavering" in commits, PRs or comments; drop the adjective.

## Bad
~~~~
unwavering
~~~~

## Good
~~~~
Update the uploader retry logic.
~~~~
