---
kind: forbid
pattern: 'runs-on:\s*ubuntu-latest\b'
targets: [files]
paths: ['.github/workflows/*.{yml,yaml}']
severity: warn
from: benchmark distractor (infra)
---
Pin the runner image (ubuntu-24.04), not ubuntu-latest.

## Bad
~~~~
    runs-on: ubuntu-latest
~~~~

## Good
~~~~
    runs-on: ubuntu-24.04
~~~~
