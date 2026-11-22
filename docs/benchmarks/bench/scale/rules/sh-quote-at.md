---
kind: forbid
pattern: '(?<!")\$@(?!")'
targets: [files]
paths: ['*.{sh,bash,zsh}']
severity: block
from: benchmark distractor (language)
---
Quote "$@" (SC2068).

## Bad
~~~~
exec node cli.js $@
~~~~

## Good
~~~~
exec node cli.js "$@"
~~~~
