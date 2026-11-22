---
kind: forbid
pattern: '\bWITH\s*\(\s*NOLOCK\s*\)'
flags: i
targets: [files]
paths: ['*.sql']
severity: block
from: benchmark distractor (language)
---
No NOLOCK hints; they read uncommitted data.

## Bad
~~~~
SELECT id FROM orders WITH (NOLOCK)
~~~~

## Good
~~~~
SELECT id FROM orders
~~~~
