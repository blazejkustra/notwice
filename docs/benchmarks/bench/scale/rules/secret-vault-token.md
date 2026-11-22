---
kind: forbid
pattern: '\bhvs\.[A-Za-z0-9_-]{24,}\b'
targets: [files, commits, pr, comments]
severity: block
from: benchmark distractor (security)
---
Never commit a HashiCorp Vault token. Read it from VAULT_TOKEN at runtime.

## Bad
~~~~
VAULT_TOKEN=hvs.KwW5YstnMVIxPMEcOxrJoPBZoFaOMGdM0mnY7srAEVwmHOSECdnR0uFgbC8sxcgQDwgCankMvaNC4Xrtx5FF0jyTS8
~~~~

## Good
~~~~
VAULT_TOKEN=${VAULT_TOKEN}
~~~~
