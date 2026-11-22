---
kind: forbid
pattern: '\bmanage\.py\s+(?:flush|reset_db)\b'
targets: [commands]
severity: block
from: benchmark distractor (commands)
---
Never flush the Django database.

## Bad
~~~~
python manage.py flush --noinput
~~~~

## Good
~~~~
python manage.py showmigrations
~~~~
