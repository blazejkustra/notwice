---
kind: forbid
pattern: 'pip3?\s+install(?![^\n]*--no-cache-dir)'
targets: [files]
paths: ['Dockerfile', 'Dockerfile.*', '*.Dockerfile']
severity: block
from: benchmark distractor (infra)
---
pip install needs --no-cache-dir in images (DL3042).

## Bad
~~~~
RUN pip install -r requirements.txt
~~~~

## Good
~~~~
RUN pip install --no-cache-dir -r requirements.txt
~~~~
