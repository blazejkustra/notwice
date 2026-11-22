---
kind: forbid
pattern: '^EXPOSE\s+22\b'
targets: [files]
paths: ['Dockerfile', 'Dockerfile.*', '*.Dockerfile']
severity: block
from: benchmark distractor (infra)
---
Never expose SSH from an app container.

## Bad
~~~~
EXPOSE 22
~~~~

## Good
~~~~
EXPOSE 8080
~~~~
