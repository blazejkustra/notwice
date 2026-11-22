---
kind: forbid
pattern: '^Bumps? [\w@/.-]+ from \d[\w.]* to \d'
targets: [commits]
severity: block
from: benchmark distractor (git)
---
Dependency bumps go through Renovate, not hand-written "Bumps x from" commits.

## Bad
~~~~
Bump lodash from 4.17.20 to 4.17.21
~~~~

## Good
~~~~
Update lockfile after Renovate merge
~~~~
