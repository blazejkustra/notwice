---
kind: forbid
pattern: '^MAINTAINER\s'
targets: [files]
paths: ['Dockerfile', 'Dockerfile.*', '*.Dockerfile']
severity: block
from: benchmark distractor (infra)
---
MAINTAINER is deprecated; use a LABEL (DL4000).

## Bad
~~~~
MAINTAINER ops@example.com
~~~~

## Good
~~~~
LABEL org.opencontainers.image.authors="ops@example.com"
~~~~
