---
kind: forbid
pattern: '\bknex\s+migrate:rollback\b[^;&|\n]*--all'
targets: [commands]
severity: block
from: benchmark distractor (commands)
---
Never roll back every Knex migration.

## Bad
~~~~
npx knex migrate:rollback --all
~~~~

## Good
~~~~
npx knex migrate:status
~~~~
