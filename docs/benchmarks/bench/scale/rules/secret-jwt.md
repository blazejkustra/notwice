---
kind: forbid
pattern: '\beyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}'
targets: [files, commits, pr, comments]
severity: block
from: benchmark distractor (security)
---
No signed JWT in code, commits, PRs or comments; load it from the environment (SERVICE_JWT).

## Bad
~~~~
SERVICE_JWT=eyJZF260S6hMU8G3ABB6wtu.eyJiEpBcLLPVqdYkBpXF7QbLaB8vqmMPFqCkaoLK6qz.q3VHpvBTamYYEnqPEJBImhKZmC0nZwOA2RFfvftfTDU
~~~~

## Good
~~~~
SERVICE_JWT=${SERVICE_JWT}
~~~~
