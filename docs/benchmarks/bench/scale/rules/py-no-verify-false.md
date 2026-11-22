---
kind: forbid
pattern: 'verify\s*=\s*False'
targets: [files]
paths: ['*.py']
severity: block
from: benchmark distractor (security)
---
Never disable TLS verification.

## Bad
~~~~
requests.get(url, verify=False, timeout=5)
~~~~

## Good
~~~~
requests.get(url, verify=ca_bundle, timeout=5)
~~~~
