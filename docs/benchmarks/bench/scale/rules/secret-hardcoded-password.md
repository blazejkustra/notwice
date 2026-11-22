---
kind: forbid
pattern: '\b(?:password|passwd|pwd)\s*[:=]\s*[''"][^''"\s]{8,}[''"]'
flags: i
targets: [files, commits, pr, comments]
severity: block
from: benchmark distractor (security)
---
A hardcoded password belongs in the secret manager, never in the repo. Reference DB_PASSWORD instead.

## Bad
~~~~
password = "RYov4pVNqC32c0"
~~~~

## Good
~~~~
DB_PASSWORD=${DB_PASSWORD}
~~~~
