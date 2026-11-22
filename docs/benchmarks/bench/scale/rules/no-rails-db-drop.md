---
kind: forbid
pattern: '\b(?:rails|rake)\s+db:(?:drop|reset|schema:load)\b'
targets: [commands]
severity: block
from: benchmark distractor (commands)
---
Never drop or reset the Rails database.

## Bad
~~~~
bin/rails db:reset
~~~~

## Good
~~~~
bin/rails db:migrate:status
~~~~
