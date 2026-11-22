---
kind: forbid
pattern: 'min_tls_version\s*=\s*"(?:TLS1_0|TLS1_1|1\.0|1\.1)"'
targets: [files]
paths: ['*.tf']
severity: block
from: benchmark distractor (infra)
---
Minimum TLS version is 1.2.

## Bad
~~~~
  min_tls_version = "TLS1_0"
~~~~

## Good
~~~~
  min_tls_version = "TLS1_2"
~~~~
