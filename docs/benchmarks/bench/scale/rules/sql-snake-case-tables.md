---
kind: forbid
pattern: '\bCREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?"?[a-z]+[A-Z]'
targets: [files]
paths: ['*.sql']
severity: block
from: benchmark distractor (language)
---
Table names are snake_case.

## Bad
~~~~
CREATE TABLE orderItems (
~~~~

## Good
~~~~
CREATE TABLE order_items (
~~~~
