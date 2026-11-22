---
kind: forbid
pattern: '^\s*\[?wip\]?\b'
flags: i
targets: [commits]
severity: block
from: benchmark distractor (git)
---
No WIP commits on shared branches.

## Bad
~~~~
WIP uploader
~~~~

## Good
~~~~
Add the upload queue
~~~~
