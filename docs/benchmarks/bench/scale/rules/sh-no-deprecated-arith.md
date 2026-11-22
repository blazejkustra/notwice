---
kind: forbid
pattern: '\$\[[^\]]+\]'
targets: [files]
paths: ['*.{sh,bash,zsh}']
severity: block
from: benchmark distractor (language)
---
Use $(( )) instead of the deprecated $[ ].

## Bad
~~~~
total=$[a + b]
~~~~

## Good
~~~~
total=$((a + b))
~~~~
