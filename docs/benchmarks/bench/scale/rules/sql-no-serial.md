---
kind: forbid
pattern: '\b(?:BIG)?SERIAL\b'
flags: i
targets: [files]
paths: ['*.sql']
severity: block
from: benchmark distractor (language)
---
Use identity columns instead of serial in Postgres.

## Bad
~~~~
id SERIAL PRIMARY KEY,
~~~~

## Good
~~~~
id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
~~~~
