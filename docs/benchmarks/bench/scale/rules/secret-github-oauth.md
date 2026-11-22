---
kind: forbid
pattern: '\bgho_[A-Za-z0-9]{36}\b'
targets: [files, commits, pr, comments]
severity: block
from: benchmark distractor (security)
---
Do not paste a GitHub OAuth token anywhere in the repo or on GitHub; pass it through GITHUB_OAUTH_TOKEN.

## Bad
~~~~
GITHUB_OAUTH_TOKEN=gho_oM7tY4qh7MrWSqGozlnsekiiSkCksSxspkp6
~~~~

## Good
~~~~
GITHUB_OAUTH_TOKEN=${GITHUB_OAUTH_TOKEN}
~~~~
