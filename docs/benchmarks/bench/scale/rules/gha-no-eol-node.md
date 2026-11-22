---
kind: forbid
pattern: 'node-version:\s*["'']?(?:1[0-9]|[0-9])(?:\.x)?["'']?\s*$'
targets: [files]
paths: ['.github/workflows/*.{yml,yaml}']
severity: block
from: benchmark distractor (infra)
---
Use a supported Node version (20 or newer) in CI.

## Bad
~~~~
          node-version: 16
~~~~

## Good
~~~~
          node-version: 22
~~~~
