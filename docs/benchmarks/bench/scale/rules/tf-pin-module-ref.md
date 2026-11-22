---
kind: forbid
pattern: 'source\s*=\s*"git::[^"]*\?ref=(?:main|master)"'
targets: [files]
paths: ['*.tf']
severity: block
from: benchmark distractor (infra)
---
Pin module sources to a tag.

## Bad
~~~~
  source = "git::https://github.com/acme/mod.git?ref=main"
~~~~

## Good
~~~~
  source = "git::https://github.com/acme/mod.git?ref=v1.4.0"
~~~~
