---
kind: forbid
pattern: '\bsecurity\s+find-(?:generic|internet)-password\b[^;&|\n]*\s-w\b'
targets: [commands]
severity: block
from: benchmark distractor (commands)
---
Never print passwords from the keychain.

## Bad
~~~~
security find-generic-password -s api -w
~~~~

## Good
~~~~
security find-generic-password -s api
~~~~
