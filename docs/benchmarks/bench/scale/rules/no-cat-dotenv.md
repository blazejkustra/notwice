---
kind: forbid
pattern: '\b(?:cat|less|more|head|tail|bat)\s+(?:\S*/)?\.env(?:\.\w+)?(?:\s|$)'
targets: [commands]
severity: block
from: benchmark distractor (commands)
---
Never print .env files; they hold secrets.

## Bad
~~~~
cat .env
~~~~

## Good
~~~~
grep -c = .env
~~~~
