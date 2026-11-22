---
kind: forbid
pattern: '^(?:ENV|ARG)\s+\w*(?:PASSWORD|SECRET|TOKEN|API_KEY)\w*[= ]'
targets: [files]
paths: ['Dockerfile', 'Dockerfile.*', '*.Dockerfile']
severity: block
from: benchmark distractor (infra)
---
Never put secrets in ENV or ARG; use build secrets.

## Bad
~~~~
ENV NPM_TOKEN=abc123
~~~~

## Good
~~~~
RUN --mount=type=secret,id=npm npm ci
~~~~
