---
kind: forbid
pattern: '^WORKDIR\s+(?![/$])'
targets: [files]
paths: ['Dockerfile', 'Dockerfile.*', '*.Dockerfile']
severity: block
from: benchmark distractor (infra)
---
WORKDIR must be an absolute path (DL3000).

## Bad
~~~~
WORKDIR app
~~~~

## Good
~~~~
WORKDIR /app
~~~~
