---
kind: forbid
pattern: '\bDROP\s+TABLE\s+(?!IF\s+EXISTS)'
flags: i
targets: [files]
paths: ['*.sql']
severity: block
from: benchmark distractor (language)
---
Use DROP TABLE IF EXISTS in migrations.

## Bad
~~~~
DROP TABLE legacy_users;
~~~~

## Good
~~~~
DROP TABLE IF EXISTS legacy_users;
~~~~
