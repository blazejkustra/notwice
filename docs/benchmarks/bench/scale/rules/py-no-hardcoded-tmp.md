---
kind: forbid
pattern: '[''"]/tmp/[\w.-]+[''"]'
targets: [files]
paths: ['*.py']
severity: block
from: benchmark distractor (security)
---
Do not hardcode /tmp paths; use tempfile.

## Bad
~~~~
path = "/tmp/report.csv"
~~~~

## Good
~~~~
path = Path(tempfile.gettempdir()) / "report.csv"
~~~~
