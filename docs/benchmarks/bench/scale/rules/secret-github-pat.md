---
kind: forbid
pattern: '\bghp_[A-Za-z0-9]{36}\b'
targets: [files, commits, pr, comments]
severity: block
from: benchmark distractor (security)
---
Do not paste a GitHub personal access token anywhere in the repo or on GitHub; pass it through GITHUB_TOKEN.

## Bad
~~~~
GITHUB_TOKEN=ghp_VxdSfAEh2JQQiVUZfAxrWgxjFlDkNyAMlsB6
~~~~

## Good
~~~~
GITHUB_TOKEN=${GITHUB_TOKEN}
~~~~
