---
kind: forbid
pattern: '\bFROM\s+\w+(?:\s+\w+)?\s*,\s*\w+(?:\s+\w+)?\s+WHERE\b'
flags: i
targets: [files]
paths: ['*.sql']
severity: block
from: benchmark distractor (language)
---
Write explicit JOINs, not comma joins.

## Bad
~~~~
SELECT o.id FROM orders o, users u WHERE o.user_id = u.id;
~~~~

## Good
~~~~
SELECT o.id FROM orders o JOIN users u ON o.user_id = u.id;
~~~~
