---
kind: forbid
pattern: '^ADD\s+(?!https?://)\S'
targets: [files]
paths: ['Dockerfile', 'Dockerfile.*', '*.Dockerfile']
severity: block
from: benchmark distractor (infra)
---
Use COPY instead of ADD for local files (DL3020).

## Bad
~~~~
ADD . /app
~~~~

## Good
~~~~
COPY . /app
~~~~
