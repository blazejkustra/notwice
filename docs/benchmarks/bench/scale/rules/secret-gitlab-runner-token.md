---
kind: forbid
pattern: '\bglrt-[A-Za-z0-9_-]{20}\b'
targets: [files, commits, pr, comments]
severity: block
from: benchmark distractor (security)
---
Never commit a GitLab runner token. Read it from GITLAB_RUNNER_TOKEN at runtime.

## Bad
~~~~
GITLAB_RUNNER_TOKEN=glrt-DJvA47bVA3UxdkOzu0pZ
~~~~

## Good
~~~~
GITLAB_RUNNER_TOKEN=${GITLAB_RUNNER_TOKEN}
~~~~
