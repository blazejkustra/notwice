---
kind: forbid
pattern: 'uses:\s*[\w.-]+/[\w./-]+@(?:master|main|latest|HEAD)\b'
targets: [files]
paths: ['.github/workflows/*.{yml,yaml}']
severity: block
from: benchmark distractor (infra)
---
Pin actions to a tag or SHA, never a branch.

## Bad
~~~~
      - uses: actions/checkout@main
~~~~

## Good
~~~~
      - uses: actions/checkout@v4
~~~~
