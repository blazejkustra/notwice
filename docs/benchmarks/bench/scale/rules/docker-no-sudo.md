---
kind: forbid
pattern: '^RUN\s.*\bsudo\b'
targets: [files]
paths: ['Dockerfile', 'Dockerfile.*', '*.Dockerfile']
severity: block
from: benchmark distractor (infra)
---
Do not use sudo in Dockerfiles (DL3004).

## Bad
~~~~
RUN sudo apt-get update
~~~~

## Good
~~~~
RUN apt-get update
~~~~
