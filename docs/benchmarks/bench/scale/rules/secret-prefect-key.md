---
kind: forbid
pattern: '\bpnu_[A-Za-z0-9]{36}\b'
targets: [files, commits, pr, comments]
severity: block
from: benchmark distractor (security)
---
Do not paste a Prefect API key anywhere in the repo or on GitHub; pass it through PREFECT_API_KEY.

## Bad
~~~~
PREFECT_API_KEY=pnu_BI9KEoWjx3wJvcvQqNQ2qU5RE4w83ICxHX29
~~~~

## Good
~~~~
PREFECT_API_KEY=${PREFECT_API_KEY}
~~~~
