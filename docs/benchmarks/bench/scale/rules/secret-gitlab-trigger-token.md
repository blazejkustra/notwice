---
kind: forbid
pattern: '\bglptt-[0-9a-f]{40}\b'
targets: [files, commits, pr, comments]
severity: block
from: benchmark distractor (security)
---
Never commit a GitLab pipeline trigger token. Read it from GITLAB_TRIGGER_TOKEN at runtime.

## Bad
~~~~
GITLAB_TRIGGER_TOKEN=glptt-e89883832d7abe2afcf8498dbd14110d7c59e046
~~~~

## Good
~~~~
GITLAB_TRIGGER_TOKEN=${GITLAB_TRIGGER_TOKEN}
~~~~
