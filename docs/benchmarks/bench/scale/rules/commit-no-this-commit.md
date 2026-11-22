---
kind: forbid
pattern: '\bthis commit\b'
flags: i
targets: [commits]
severity: block
from: benchmark distractor (git)
---
Write what the change does, not "This commit".

## Bad
~~~~
This commit adds caching to the API client.
~~~~

## Good
~~~~
Cache API responses for 60 seconds.
~~~~
