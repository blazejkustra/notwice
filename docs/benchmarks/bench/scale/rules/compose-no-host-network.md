---
kind: forbid
pattern: '^\s*network_mode:\s*["'']?host\b'
targets: [files]
paths: ['docker-compose*.{yml,yaml}', 'compose*.{yml,yaml}']
severity: block
from: benchmark distractor (infra)
---
Do not use host networking in compose files.

## Bad
~~~~
    network_mode: host
~~~~

## Good
~~~~
    networks: [backend]
~~~~
