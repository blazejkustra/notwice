---
kind: forbid
pattern: '^\s*required\s+\w+\s+\w+\s*='
targets: [files]
paths: ['*.proto']
severity: block
from: benchmark distractor (infra)
---
Do not use required fields in protobuf.

## Bad
~~~~
  required string id = 1;
~~~~

## Good
~~~~
  string id = 1;
~~~~
