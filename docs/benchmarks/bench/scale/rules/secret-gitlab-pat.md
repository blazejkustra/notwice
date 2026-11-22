---
kind: forbid
pattern: '\bglpat-[A-Za-z0-9_-]{20}\b'
targets: [files, commits, pr, comments]
severity: block
from: benchmark distractor (security)
---
Do not paste a GitLab personal access token anywhere in the repo or on GitHub; pass it through GITLAB_TOKEN.

## Bad
~~~~
GITLAB_TOKEN=glpat-ncVsSvFins9fXHQmdfkC
~~~~

## Good
~~~~
GITLAB_TOKEN=${GITLAB_TOKEN}
~~~~
