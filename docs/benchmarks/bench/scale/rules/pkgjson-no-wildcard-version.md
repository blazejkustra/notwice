---
kind: forbid
pattern: '"[@\w/.-]+":\s*"(?:\*|latest)"'
targets: [files]
paths: ['package.json']
severity: block
from: benchmark distractor (infra)
---
Never depend on "*" or "latest" in package.json.

## Bad
~~~~
    "react": "latest",
~~~~

## Good
~~~~
    "react": "^19.2.0",
~~~~
