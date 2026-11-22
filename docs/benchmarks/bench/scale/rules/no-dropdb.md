---
kind: forbid
pattern: '(?:^|[;&|]\s*)dropdb\s'
targets: [commands]
severity: block
from: benchmark distractor (commands)
---
Never drop databases from a session.

## Bad
~~~~
dropdb app_production
~~~~

## Good
~~~~
psql -l
~~~~
