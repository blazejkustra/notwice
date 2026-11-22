---
kind: forbid
pattern: 'actions/checkout@v[123]\b'
targets: [files]
paths: ['.github/workflows/*.{yml,yaml}']
severity: block
from: benchmark distractor (infra)
---
Use actions/checkout@v4 or newer.

## Bad
~~~~
      - uses: actions/checkout@v2
~~~~

## Good
~~~~
      - uses: actions/checkout@v4
~~~~
