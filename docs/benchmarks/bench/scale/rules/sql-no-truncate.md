---
kind: forbid
pattern: '^\s*TRUNCATE\b'
flags: i
targets: [files]
paths: ['*.sql']
severity: block
from: benchmark distractor (language)
---
Do not TRUNCATE in migrations.

## Bad
~~~~
TRUNCATE audit_log;
~~~~

## Good
~~~~
DELETE FROM audit_log WHERE created_at < now() - interval '90 days';
~~~~
