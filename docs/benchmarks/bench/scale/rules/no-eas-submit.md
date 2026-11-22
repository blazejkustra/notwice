---
kind: forbid
pattern: '\beas\s+submit\b|\beas\s+build\b[^;&|\n]*--auto-submit'
targets: [commands]
severity: block
from: benchmark distractor (commands)
---
Do not submit builds to the stores from a session.

## Bad
~~~~
eas submit -p ios --latest
~~~~

## Good
~~~~
eas build -p ios --profile preview
~~~~
