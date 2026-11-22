---
kind: forbid
pattern: '(?:curl|wget)[^|\n]*\|\s*(?:ba)?sh\b'
targets: [files]
paths: ['Dockerfile', 'Dockerfile.*', '*.Dockerfile']
severity: block
from: benchmark distractor (infra)
---
Do not pipe downloads into sh in Dockerfiles.

## Bad
~~~~
RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash
~~~~

## Good
~~~~
COPY --from=node:22 /usr/local/bin/node /usr/local/bin/node
~~~~
