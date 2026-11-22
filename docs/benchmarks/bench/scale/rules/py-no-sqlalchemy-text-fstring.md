---
kind: forbid
pattern: '\btext\(\s*f[''"]'
targets: [files]
paths: ['*.py']
severity: block
from: benchmark distractor (security)
---
Never build SQLAlchemy text() queries with f-strings; bind parameters.

## Bad
~~~~
session.execute(text(f"DELETE FROM t WHERE id={i}"))
~~~~

## Good
~~~~
session.execute(text("DELETE FROM t WHERE id=:id"), {"id": i})
~~~~
