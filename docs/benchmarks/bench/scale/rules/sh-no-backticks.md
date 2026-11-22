---
kind: forbid
pattern: '`[^`\n]+`'
targets: [files]
paths: ['*.{sh,bash,zsh}']
severity: block
from: benchmark distractor (language)
---
Use $(...) instead of backticks for command substitution.

## Bad
~~~~
today=`date +%F`
~~~~

## Good
~~~~
today=$(date +%F)
~~~~
