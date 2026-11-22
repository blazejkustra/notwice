---
kind: forbid
pattern: '\$\(\s*expr\s'
targets: [files]
paths: ['*.{sh,bash,zsh}']
severity: block
from: benchmark distractor (language)
---
Use $(( )) instead of expr.

## Bad
~~~~
n=$(expr $n + 1)
~~~~

## Good
~~~~
n=$((n + 1))
~~~~
