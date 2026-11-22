---
kind: forbid
pattern: '^\s*continue-on-error:\s*true\b'
targets: [files]
paths: ['.github/workflows/*.{yml,yaml}']
severity: block
from: benchmark distractor (infra)
---
Do not hide failing steps with continue-on-error.

## Bad
~~~~
        continue-on-error: true
~~~~

## Good
~~~~
        timeout-minutes: 10
~~~~
