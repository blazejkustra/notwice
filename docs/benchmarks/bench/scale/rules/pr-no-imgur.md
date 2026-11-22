---
kind: forbid
pattern: '\bi\.imgur\.com/'
targets: [pr, comments]
severity: block
from: benchmark distractor (git)
---
Attach screenshots to the PR instead of linking external image hosts.

## Bad
~~~~
![shot](https://i.imgur.com/abc123.png)
~~~~

## Good
~~~~
![shot](./shot.png)
~~~~
