---
kind: forbid
pattern: '^\s*(?:\[WIP\]|WIP:)'
targets: [pr]
severity: block
from: benchmark distractor (git)
---
Open a draft PR instead of a [WIP] title.

## Bad
~~~~
[WIP] New uploader
~~~~

## Good
~~~~
New uploader
~~~~
