---
kind: forbid
pattern: '\bGRANT\s+ALL\b'
flags: i
targets: [files]
paths: ['*.sql']
severity: block
from: benchmark distractor (language)
---
Grant only the privileges a role needs.

## Bad
~~~~
GRANT ALL ON ALL TABLES IN SCHEMA public TO app;
~~~~

## Good
~~~~
GRANT SELECT, INSERT ON orders TO app;
~~~~
