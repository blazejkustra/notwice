---
kind: forbid
pattern: '\b(?:cat|less|more|head|tail|bat|pbcopy)\b[^;&|\n]*\.ssh/id_\w+(?!\.pub)\b'
targets: [commands]
severity: block
from: benchmark distractor (commands)
---
Never print SSH private keys.

## Bad
~~~~
cat ~/.ssh/id_ed25519
~~~~

## Good
~~~~
cat ~/.ssh/id_ed25519.pub
~~~~
