---
kind: forbid
pattern: '\bnpx\s+create-[\w-]+\s+\.(?:\s|$)'
targets: [commands]
severity: block
from: benchmark distractor (commands)
---
Do not scaffold a new app into the current repo.

## Bad
~~~~
npx create-next-app .
~~~~

## Good
~~~~
npx create-next-app ../scratch-app
~~~~
