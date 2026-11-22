---
kind: forbid
pattern: '^\w[\w-]*\s*=\s*"\*"'
targets: [files]
paths: ['Cargo.toml']
severity: block
from: benchmark distractor (infra)
---
No wildcard versions in Cargo.toml.

## Bad
~~~~
serde = "*"
~~~~

## Good
~~~~
serde = "1.0"
~~~~
