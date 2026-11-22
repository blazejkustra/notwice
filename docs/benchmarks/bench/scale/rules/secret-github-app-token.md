---
kind: forbid
pattern: '\b(?:ghu|ghs)_[A-Za-z0-9]{36}\b'
targets: [files, commits, pr, comments]
severity: block
from: benchmark distractor (security)
---
No GitHub App token in code, commits, PRs or comments; load it from the environment (GITHUB_APP_TOKEN).

## Bad
~~~~
GITHUB_APP_TOKEN=ghs_Jt9xP52TAgJrT1ngdYa573ENX5V4MOqgb1sd
~~~~

## Good
~~~~
GITHUB_APP_TOKEN=${GITHUB_APP_TOKEN}
~~~~
