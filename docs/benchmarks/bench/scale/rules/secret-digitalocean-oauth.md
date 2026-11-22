---
kind: forbid
pattern: '\bdoo_v1_[a-f0-9]{64}\b'
targets: [files, commits, pr, comments]
severity: block
from: benchmark distractor (security)
---
A DigitalOcean OAuth token belongs in the secret manager, never in the repo. Reference DIGITALOCEAN_OAUTH_TOKEN instead.

## Bad
~~~~
DIGITALOCEAN_OAUTH_TOKEN=doo_v1_7863f695ea6a3082a0cc8077a226f61f758f5f91cf7de1da84777bc7a6b3350d
~~~~

## Good
~~~~
DIGITALOCEAN_OAUTH_TOKEN=${DIGITALOCEAN_OAUTH_TOKEN}
~~~~
