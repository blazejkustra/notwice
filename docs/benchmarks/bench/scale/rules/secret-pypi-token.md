---
kind: forbid
pattern: '\bpypi-AgEIcHlwaS5vcmc[A-Za-z0-9_-]{50,}'
targets: [files, commits, pr, comments]
severity: block
from: benchmark distractor (security)
---
Never commit a PyPI upload token. Read it from PYPI_TOKEN at runtime.

## Bad
~~~~
PYPI_TOKEN=pypi-AgEIcHlwaS5vcmcWJjhLuQJcIGN50UTRsNWoxbJY7T14aU189g8kdY1xcedXEkY3SiOdAI51jvW
~~~~

## Good
~~~~
PYPI_TOKEN=${PYPI_TOKEN}
~~~~
