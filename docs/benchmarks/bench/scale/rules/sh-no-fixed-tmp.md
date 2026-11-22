---
kind: forbid
pattern: '/tmp/[\w.-]+\.(?:txt|log|json|sh|out)\b'
targets: [files]
paths: ['*.{sh,bash,zsh}']
severity: block
from: benchmark distractor (language)
---
Use mktemp instead of fixed /tmp file names.

## Bad
~~~~
out=/tmp/report.txt
~~~~

## Good
~~~~
out=$(mktemp)
~~~~
