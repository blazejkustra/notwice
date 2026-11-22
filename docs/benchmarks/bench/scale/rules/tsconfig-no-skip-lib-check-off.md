---
kind: forbid
pattern: '"noImplicitAny":\s*false'
targets: [files]
paths: ['tsconfig*.json']
severity: block
from: benchmark distractor (infra)
---
Never turn off noImplicitAny.

## Bad
~~~~
    "noImplicitAny": false,
~~~~

## Good
~~~~
    "noImplicitAny": true,
~~~~
