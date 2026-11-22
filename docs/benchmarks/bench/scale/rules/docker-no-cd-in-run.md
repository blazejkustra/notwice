---
kind: forbid
pattern: '^RUN\s+cd\s'
targets: [files]
paths: ['Dockerfile', 'Dockerfile.*', '*.Dockerfile']
severity: block
from: benchmark distractor (infra)
---
Use WORKDIR instead of cd in RUN (DL3003).

## Bad
~~~~
RUN cd /app && npm ci
~~~~

## Good
~~~~
WORKDIR /app
~~~~
