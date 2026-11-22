---
kind: forbid
pattern: '^\[[A-Z]{2,10}-\d+\]'
targets: [commits]
severity: block
from: benchmark distractor (git)
---
Put ticket keys in the body as "Refs: ABC-123", not in brackets at the start.

## Bad
~~~~
[PAY-12] Retry failed charges
~~~~

## Good
~~~~
Retry failed charges
~~~~
