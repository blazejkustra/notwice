---
kind: forbid
pattern: '^\s*machine\s+\S+\s+login\s+\S+\s+password\s+\S+'
targets: [files, commits, pr, comments]
severity: block
from: benchmark distractor (security)
---
Never commit a .netrc password. Read it from NETRC at runtime.

## Bad
~~~~
machine api.example.com login deploy password IFMU983oc5AezCIkRQM9
~~~~

## Good
~~~~
NETRC=${NETRC}
~~~~
