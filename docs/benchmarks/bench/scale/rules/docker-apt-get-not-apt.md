---
kind: forbid
pattern: '^RUN\s+apt\s'
targets: [files]
paths: ['Dockerfile', 'Dockerfile.*', '*.Dockerfile']
severity: block
from: benchmark distractor (infra)
---
Use apt-get, not apt, in Dockerfiles (DL3027).

## Bad
~~~~
RUN apt install -y git
~~~~

## Good
~~~~
RUN apt-get install -y --no-install-recommends git
~~~~
