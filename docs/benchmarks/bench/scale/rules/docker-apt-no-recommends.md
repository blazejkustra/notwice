---
kind: forbid
pattern: 'apt-get\s+install(?![^\n]*--no-install-recommends)'
targets: [files]
paths: ['Dockerfile', 'Dockerfile.*', '*.Dockerfile']
severity: block
from: benchmark distractor (infra)
---
apt-get install needs --no-install-recommends (DL3015).

## Bad
~~~~
RUN apt-get install -y curl
~~~~

## Good
~~~~
RUN apt-get install -y --no-install-recommends curl
~~~~
