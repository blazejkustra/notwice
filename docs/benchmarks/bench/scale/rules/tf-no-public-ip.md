---
kind: forbid
pattern: 'associate_public_ip_address\s*=\s*true'
targets: [files]
paths: ['*.tf']
severity: block
from: benchmark distractor (infra)
---
Instances do not get public IPs; use a load balancer.

## Bad
~~~~
  associate_public_ip_address = true
~~~~

## Good
~~~~
  associate_public_ip_address = false
~~~~
