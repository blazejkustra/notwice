---
kind: forbid
pattern: 'PuTTY-User-Key-File-\d:'
targets: [files, commits, pr, comments]
severity: block
from: benchmark distractor (security)
---
Never commit a PuTTY private key. Read it from DEPLOY_KEY_PATH at runtime.

## Bad
~~~~
PuTTY-User-Key-File-3: ssh-ed25519
~~~~

## Good
~~~~
DEPLOY_KEY_PATH=${DEPLOY_KEY_PATH}
~~~~
