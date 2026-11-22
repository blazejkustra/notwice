---
kind: forbid
pattern: 'rm\s+-rf\s+"?\$\{?\w+\}?"?/'
targets: [files]
paths: ['*.{sh,bash,zsh}']
severity: block
from: benchmark distractor (language)
---
Never rm -rf "$VAR/" without guarding VAR (SC2115).

## Bad
~~~~
rm -rf "$PREFIX/"
~~~~

## Good
~~~~
rm -rf "${PREFIX:?}/"
~~~~
