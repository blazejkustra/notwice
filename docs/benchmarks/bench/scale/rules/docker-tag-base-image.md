---
kind: forbid
pattern: '^FROM\s+(?!scratch\b)[\w./-]+(?:\s+AS\s+\w+)?\s*$'
flags: i
targets: [files]
paths: ['Dockerfile', 'Dockerfile.*', '*.Dockerfile']
severity: block
from: benchmark distractor (infra)
---
Tag every base image (DL3006).

## Bad
~~~~
FROM python
~~~~

## Good
~~~~
FROM python:3.13-slim
~~~~
