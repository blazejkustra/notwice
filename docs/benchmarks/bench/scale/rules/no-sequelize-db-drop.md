---
kind: forbid
pattern: '\bsequelize(?:-cli)?\s+db:drop\b'
targets: [commands]
severity: block
from: benchmark distractor (commands)
---
Never drop the database with Sequelize.

## Bad
~~~~
npx sequelize db:drop
~~~~

## Good
~~~~
npx sequelize db:migrate:status
~~~~
