---
kind: forbid
pattern: '"strict":\s*false'
targets: [files]
paths: ['tsconfig*.json']
severity: block
from: benchmark distractor (infra)
---
Keep strict mode on in tsconfig.

## Bad
~~~~
    "strict": false,
~~~~

## Good
~~~~
    "strict": true,
~~~~
