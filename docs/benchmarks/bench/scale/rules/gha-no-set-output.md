---
kind: forbid
pattern: '::(?:set-output|save-state|set-env|add-path)\b'
targets: [files]
paths: ['.github/workflows/*.{yml,yaml}']
severity: block
from: benchmark distractor (infra)
---
Workflow commands like ::set-output are removed; write to $GITHUB_OUTPUT.

## Bad
~~~~
        run: echo "::set-output name=v::1"
~~~~

## Good
~~~~
        run: echo "v=1" >> "$GITHUB_OUTPUT"
~~~~
