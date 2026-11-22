---
kind: forbid
pattern: '\bpip3?\s+install\b[^;&|\n]*\s--user\b'
targets: [commands]
severity: block
from: benchmark distractor (commands)
---
Install Python packages into the project venv, not --user.

## Bad
~~~~
pip install --user black
~~~~

## Good
~~~~
.venv/bin/pip install black
~~~~
