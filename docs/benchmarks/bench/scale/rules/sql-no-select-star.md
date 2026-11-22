---
kind: forbid
pattern: '\bSELECT\s+\*\s+FROM\b'
flags: i
targets: [files]
paths: ['*.sql']
severity: block
from: benchmark distractor (language)
---
Name the columns; never SELECT *.

## Bad
~~~~
SELECT * FROM orders WHERE id = $1;
~~~~

## Good
~~~~
SELECT id, total, status FROM orders WHERE id = $1;
~~~~
