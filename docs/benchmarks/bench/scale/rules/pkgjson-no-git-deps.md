---
kind: forbid
pattern: '"[@\w/.-]+":\s*"(?:git\+|github:|git://)'
targets: [files]
paths: ['package.json']
severity: block
from: benchmark distractor (infra)
---
No git dependencies in package.json; publish or vendor the package.

## Bad
~~~~
    "ui": "github:acme/ui",
~~~~

## Good
~~~~
    "@acme/ui": "^2.1.0",
~~~~
