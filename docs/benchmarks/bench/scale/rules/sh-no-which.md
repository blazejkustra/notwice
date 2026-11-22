---
kind: forbid
pattern: '\bwhich\s+\w'
targets: [files]
paths: ['*.{sh,bash,zsh}']
severity: block
from: benchmark distractor (language)
---
Use command -v instead of which.

## Bad
~~~~
if which jq >/dev/null; then
~~~~

## Good
~~~~
if command -v jq >/dev/null; then
~~~~
