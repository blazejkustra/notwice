---
kind: forbid
pattern: '\bsq0csp-[0-9A-Za-z_-]{43}\b'
targets: [files, commits, pr, comments]
severity: block
from: benchmark distractor (security)
---
A Square application secret belongs in the secret manager, never in the repo. Reference SQUARE_APP_SECRET instead.

## Bad
~~~~
SQUARE_APP_SECRET=sq0csp-XUChTs5aRcfQaDJf6vOdvSQ3NzStlYA9LiYo4pb5KGl
~~~~

## Good
~~~~
SQUARE_APP_SECRET=${SQUARE_APP_SECRET}
~~~~
