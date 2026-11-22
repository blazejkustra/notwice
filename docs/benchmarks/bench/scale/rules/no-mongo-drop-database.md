---
kind: forbid
pattern: '\bdropDatabase\(\)'
targets: [commands]
severity: block
from: benchmark distractor (commands)
---
Never drop MongoDB databases.

## Bad
~~~~
mongosh app --eval "db.dropDatabase()"
~~~~

## Good
~~~~
mongosh app --eval "db.stats()"
~~~~
