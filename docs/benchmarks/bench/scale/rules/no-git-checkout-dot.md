---
kind: forbid
pattern: '\bgit\s+(?:checkout|restore)\s+(?:--\s+)?\.(?:\s|$)'
targets: [commands]
severity: block
from: benchmark distractor (commands)
---
Do not discard all working tree changes; they may be the user's.

## Bad
~~~~
git checkout -- .
~~~~

## Good
~~~~
git checkout -- src/old.ts
~~~~
