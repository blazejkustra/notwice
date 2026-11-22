---
kind: forbid
pattern: 'heroku.{0,20}[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}'
flags: i
targets: [files, commits, pr, comments]
severity: block
from: benchmark distractor (security)
---
No Heroku API key in code, commits, PRs or comments; load it from the environment (HEROKU_API_KEY).

## Bad
~~~~
HEROKU_API_KEY=729bb013-d983-3160-8e5b-872f733ec66b
~~~~

## Good
~~~~
HEROKU_API_KEY=${HEROKU_API_KEY}
~~~~
