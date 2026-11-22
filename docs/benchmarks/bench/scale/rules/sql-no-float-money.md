---
kind: forbid
pattern: '\b(?:price|amount|total|balance|cost)\w*\s+(?:FLOAT|DOUBLE|REAL)\b'
flags: i
targets: [files]
paths: ['*.sql']
severity: block
from: benchmark distractor (language)
---
Store money as NUMERIC or integer cents, never FLOAT.

## Bad
~~~~
amount FLOAT NOT NULL,
~~~~

## Good
~~~~
amount_cents BIGINT NOT NULL,
~~~~
