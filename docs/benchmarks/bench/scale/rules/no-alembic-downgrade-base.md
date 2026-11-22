---
kind: forbid
pattern: '\balembic\s+downgrade\s+base\b'
targets: [commands]
severity: block
from: benchmark distractor (commands)
---
Never downgrade Alembic to base.

## Bad
~~~~
alembic downgrade base
~~~~

## Good
~~~~
alembic current
~~~~
