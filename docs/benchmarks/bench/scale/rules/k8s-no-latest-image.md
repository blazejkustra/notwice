---
kind: forbid
pattern: 'image:\s*[\w./-]+:latest\b'
targets: [files]
paths: ['k8s/**/*.{yml,yaml}', 'deploy/**/*.{yml,yaml}', 'charts/**/*.{yml,yaml}']
severity: block
from: benchmark distractor (infra)
---
Pin container images; never :latest.

## Bad
~~~~
        image: api:latest
~~~~

## Good
~~~~
        image: api:1.42.0
~~~~
