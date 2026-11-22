---
kind: forbid
pattern: '^\s*eval\s'
targets: [files]
paths: ['*.{sh,bash,zsh}']
severity: block
from: benchmark distractor (security)
---
Do not use eval in shell scripts.

## Bad
~~~~
eval "$cmd"
~~~~

## Good
~~~~
"${cmd[@]}"
~~~~
