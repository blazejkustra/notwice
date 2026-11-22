---
kind: forbid
pattern: '\brdme_[a-z0-9]{70}\b'
targets: [files, commits, pr, comments]
severity: block
from: benchmark distractor (security)
---
A ReadMe API key belongs in the secret manager, never in the repo. Reference README_API_KEY instead.

## Bad
~~~~
README_API_KEY=rdme_0c184l8a86qqhwpn6oygj53vhuz3fyjx2izv3yv85m03piqs89p1jyeuy5gicj6lfllvc3
~~~~

## Good
~~~~
README_API_KEY=${README_API_KEY}
~~~~
