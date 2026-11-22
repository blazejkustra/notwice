---
kind: forbid
pattern: 'runs-on:\s*self-hosted\b'
targets: [files]
paths: ['.github/workflows/*.{yml,yaml}']
severity: block
from: benchmark distractor (infra)
---
Public repos must not use self-hosted runners.

## Bad
~~~~
    runs-on: self-hosted
~~~~

## Good
~~~~
    runs-on: ubuntu-24.04
~~~~
