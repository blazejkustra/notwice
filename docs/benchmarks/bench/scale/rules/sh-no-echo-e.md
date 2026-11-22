---
kind: forbid
pattern: '\becho\s+-e\b'
targets: [files]
paths: ['*.{sh,bash,zsh}']
severity: block
from: benchmark distractor (language)
---
Use printf instead of echo -e.

## Bad
~~~~
echo -e "a\tb"
~~~~

## Good
~~~~
printf "a\tb\n"
~~~~
