---
kind: forbid
pattern: '\bCREATE\s+(?:UNIQUE\s+)?INDEX\s+(?!CONCURRENTLY)'
flags: i
targets: [files]
paths: ['**/migrations/**/*.sql']
severity: block
from: benchmark distractor (language)
---
Create indexes CONCURRENTLY in production migrations.

## Bad
~~~~
CREATE INDEX idx_orders_user ON orders (user_id);
~~~~

## Good
~~~~
CREATE INDEX CONCURRENTLY idx_orders_user ON orders (user_id);
~~~~
