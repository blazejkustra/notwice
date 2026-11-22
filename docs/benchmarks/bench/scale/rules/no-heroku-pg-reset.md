---
kind: forbid
pattern: '\bheroku\s+pg:reset\b'
targets: [commands]
severity: block
from: benchmark distractor (commands)
---
Never reset a Heroku database.

## Bad
~~~~
heroku pg:reset DATABASE_URL
~~~~

## Good
~~~~
heroku pg:info
~~~~
