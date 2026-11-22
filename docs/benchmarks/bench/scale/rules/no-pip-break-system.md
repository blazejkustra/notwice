---
kind: forbid
pattern: '\bpip3?\s+install\b[^;&|\n]*--break-system-packages'
targets: [commands]
severity: block
from: benchmark distractor (commands)
---
Never pip install with --break-system-packages; use a venv.

## Bad
~~~~
pip install --break-system-packages requests
~~~~

## Good
~~~~
python -m venv .venv && .venv/bin/pip install requests
~~~~
