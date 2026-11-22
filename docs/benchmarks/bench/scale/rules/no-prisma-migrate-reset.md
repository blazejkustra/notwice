---
kind: forbid
pattern: '\bprisma\s+(?:migrate\s+reset|db\s+push\b[^;&|\n]*--force-reset)'
targets: [commands]
severity: block
from: benchmark distractor (commands)
---
Never reset the database with Prisma.

## Bad
~~~~
npx prisma migrate reset --force
~~~~

## Good
~~~~
npx prisma migrate status
~~~~
