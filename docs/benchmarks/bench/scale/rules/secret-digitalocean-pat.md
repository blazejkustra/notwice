---
kind: forbid
pattern: '\bdop_v1_[a-f0-9]{64}\b'
targets: [files, commits, pr, comments]
severity: block
from: benchmark distractor (security)
---
A DigitalOcean token belongs in the secret manager, never in the repo. Reference DIGITALOCEAN_TOKEN instead.

## Bad
~~~~
DIGITALOCEAN_TOKEN=dop_v1_ab672516446e9c97d95f6109f40fc2f58238249b0214aaf695032524adf7b23d
~~~~

## Good
~~~~
DIGITALOCEAN_TOKEN=${DIGITALOCEAN_TOKEN}
~~~~
