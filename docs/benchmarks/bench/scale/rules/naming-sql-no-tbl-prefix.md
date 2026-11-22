---
kind: forbid
pattern: '\bCREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?"?tbl_?'
flags: i
targets: [files]
paths: ['*.sql']
severity: block
from: benchmark distractor (naming)
---
No tbl prefixes on table names.

## Bad
~~~~
CREATE TABLE tbl_users (
~~~~

## Good
~~~~
CREATE TABLE users (
~~~~
