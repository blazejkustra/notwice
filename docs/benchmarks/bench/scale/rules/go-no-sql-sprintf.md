---
kind: forbid
pattern: '\.(?:Query|Exec|QueryRow)(?:Context)?\([^)]*fmt\.Sprintf\('
targets: [files]
paths: ['*.go']
severity: block
from: benchmark distractor (security)
---
Never build SQL with fmt.Sprintf; use placeholders.

## Bad
~~~~
db.Query(fmt.Sprintf("SELECT * FROM t WHERE id=%d", id))
~~~~

## Good
~~~~
db.Query("SELECT * FROM t WHERE id = $1", id)
~~~~
