---
kind: forbid
pattern: '^version:\s*["'']?\d'
targets: [files]
paths: ['docker-compose*.{yml,yaml}', 'compose*.{yml,yaml}']
severity: block
from: benchmark distractor (infra)
---
The top-level version key is obsolete in Compose files.

## Bad
~~~~
version: "3.8"
~~~~

## Good
~~~~
services:
~~~~
