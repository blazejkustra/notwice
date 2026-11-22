---
kind: forbid
pattern: '^\s*privileged:\s*true\b'
targets: [files]
paths: ['docker-compose*.{yml,yaml}', 'compose*.{yml,yaml}']
severity: block
from: benchmark distractor (infra)
---
No privileged containers in compose files.

## Bad
~~~~
    privileged: true
~~~~

## Good
~~~~
    cap_add: [NET_ADMIN]
~~~~
