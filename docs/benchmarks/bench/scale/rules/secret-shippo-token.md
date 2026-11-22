---
kind: forbid
pattern: '\bshippo_live_[a-f0-9]{40}\b'
targets: [files, commits, pr, comments]
severity: block
from: benchmark distractor (security)
---
No Shippo live token in code, commits, PRs or comments; load it from the environment (SHIPPO_API_TOKEN).

## Bad
~~~~
SHIPPO_API_TOKEN=shippo_live_bf24b1028f765a31a81e6d2372de8cb561152ee2
~~~~

## Good
~~~~
SHIPPO_API_TOKEN=${SHIPPO_API_TOKEN}
~~~~
