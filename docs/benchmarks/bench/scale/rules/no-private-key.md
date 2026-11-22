---
kind: forbid
pattern: ['-----BEGIN [A-Z ]*PRIVATE KEY( BLOCK)?-----', 'LS0tLS1CRUdJTi[A-Za-z0-9+/]{0,40}?(UFJJVkFURSBLRVk|BSSVZBVEUgS0VZ|QUklWQVRFIEtFW)', 'MIGTAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBHkwdwIBAQQg']
targets: [files, commits, pr, comments]
severity: block
locked: true
from: ratchet starter set
---
Never add a private key to files, commits, PRs or comments. Pass secrets through env vars or a secrets store.

## Bad
A placeholder in the shape of a PEM key header (no real key here):
```
-----BEGIN PRIVATE KEY-----
```

## Good
```
const key = process.env.ASC_PRIVATE_KEY
```
