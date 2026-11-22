---
kind: forbid
pattern: '\bgit\s+clean\s+-[a-z]*f[a-z]*d[a-z]*x|\bgit\s+clean\s+-[a-z]*x[a-z]*f'
targets: [commands]
severity: block
from: benchmark distractor (commands)
---
Never run git clean -fdx; it deletes ignored local files such as .env.

## Bad
~~~~
git clean -fdx
~~~~

## Good
~~~~
git clean -n
~~~~
