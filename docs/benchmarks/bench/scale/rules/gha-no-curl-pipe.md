---
kind: forbid
pattern: 'run:.*(?:curl|wget)[^|\n]*\|\s*(?:ba)?sh\b'
targets: [files]
paths: ['.github/workflows/*.{yml,yaml}']
severity: block
from: benchmark distractor (infra)
---
Do not pipe downloads into a shell in CI.

## Bad
~~~~
        run: curl -sSL https://install.example.sh | bash
~~~~

## Good
~~~~
        uses: example/setup-tool@v2
~~~~
