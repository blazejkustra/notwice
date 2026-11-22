---
kind: forbid
pattern: '/var/run/docker\.sock'
targets: [files]
paths: ['docker-compose*.{yml,yaml}', 'compose*.{yml,yaml}']
severity: block
from: benchmark distractor (infra)
---
Never mount the Docker socket into containers.

## Bad
~~~~
      - /var/run/docker.sock:/var/run/docker.sock
~~~~

## Good
~~~~
      - ./data:/data
~~~~
