---
kind: forbid
pattern: '\bgit\s+push\b[^;&|\n]*\s(?:--force(?!-with-lease)\b|-f\b)'
targets: [commands]
severity: block
from: benchmark distractor (commands)
---
Never force push. Use --force-with-lease on your own branch if history must change.

## Bad
~~~~
git push --force origin feature
~~~~

## Good
~~~~
git push --force-with-lease origin feature
~~~~
