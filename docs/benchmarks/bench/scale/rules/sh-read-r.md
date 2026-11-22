---
kind: forbid
pattern: '\bread\s+(?!-\w*r)[a-zA-Z_]'
targets: [files]
paths: ['*.{sh,bash,zsh}']
severity: block
from: benchmark distractor (language)
---
Always use read -r (SC2162).

## Bad
~~~~
while read line; do
~~~~

## Good
~~~~
while IFS= read -r line; do
~~~~
