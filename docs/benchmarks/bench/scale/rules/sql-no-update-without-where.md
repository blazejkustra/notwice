---
kind: forbid
pattern: '^\s*UPDATE\s+\w+\s+SET\s+(?![^;]*\bWHERE\b)[^;]*;'
flags: i
targets: [files]
paths: ['*.sql']
severity: block
from: benchmark distractor (language)
---
UPDATE statements need a WHERE clause.

## Bad
~~~~
UPDATE users SET active = false;
~~~~

## Good
~~~~
UPDATE users SET active = false WHERE last_seen < now() - interval '1 year';
~~~~
