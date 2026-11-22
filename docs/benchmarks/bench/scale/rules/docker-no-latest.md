---
kind: forbid
pattern: '^FROM\s+[\w./-]+:latest\b'
targets: [files]
paths: ['Dockerfile', 'Dockerfile.*', '*.Dockerfile']
severity: block
from: benchmark distractor (infra)
---
Pin base images to a version, never :latest (DL3007).

## Bad
~~~~
FROM node:latest
~~~~

## Good
~~~~
FROM node:22.11-alpine
~~~~
