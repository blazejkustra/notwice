---
kind: forbid
pattern: '\bfigd_[A-Za-z0-9_-]{40}\b'
targets: [files, commits, pr, comments]
severity: block
from: benchmark distractor (security)
---
A Figma personal access token belongs in the secret manager, never in the repo. Reference FIGMA_TOKEN instead.

## Bad
~~~~
FIGMA_TOKEN=figd_cNFhTBVhdUnCNCRvd5JdfShn1C1otgkCiT3iFleq
~~~~

## Good
~~~~
FIGMA_TOKEN=${FIGMA_TOKEN}
~~~~
