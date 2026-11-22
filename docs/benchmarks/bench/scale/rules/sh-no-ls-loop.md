---
kind: forbid
pattern: 'for\s+\w+\s+in\s+\$\(ls\b'
targets: [files]
paths: ['*.{sh,bash,zsh}']
severity: block
from: benchmark distractor (language)
---
Do not loop over ls output; use globs (SC2045).

## Bad
~~~~
for f in $(ls *.csv); do
~~~~

## Good
~~~~
for f in ./*.csv; do
~~~~
