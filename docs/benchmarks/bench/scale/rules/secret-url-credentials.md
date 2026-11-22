---
kind: forbid
pattern: '\b[a-z][a-z0-9+.-]*://[^\s:@/''"]+:[^\s:@/''"]+@[\w.-]+'
targets: [files, commits, pr, comments]
severity: block
from: benchmark distractor (security)
---
Never commit a password inside a URL. Read it from DATABASE_URL at runtime.

## Bad
~~~~
DATABASE_URL=postgres://admin:mhJW1WS0eOFt54lP@db.internal:5432/app
~~~~

## Good
~~~~
DATABASE_URL=${DATABASE_URL}
~~~~
