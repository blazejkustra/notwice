---
kind: forbid
pattern: '\bgit\s+(?:commit|push|merge)\b[^;&|\n]*\s--no-verify\b|\bgit\s+commit\b[^;&|\n]*\s-n\b'
targets: [commands]
severity: block
from: benchmark distractor (commands)
---
Never skip git hooks with --no-verify.

## Bad
~~~~
git commit --no-verify -m "wip"
~~~~

## Good
~~~~
git commit -m "Fix lint errors"
~~~~
