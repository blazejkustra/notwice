---
kind: forbid
pattern: '^\s*DELETE\s+FROM\s+\w+\s*;'
flags: i
targets: [files]
paths: ['*.sql']
severity: block
from: benchmark distractor (language)
---
DELETE statements need a WHERE clause.

## Bad
~~~~
DELETE FROM sessions;
~~~~

## Good
~~~~
DELETE FROM sessions WHERE expires_at < now();
~~~~
