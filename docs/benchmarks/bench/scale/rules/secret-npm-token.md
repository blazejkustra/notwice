---
kind: forbid
pattern: '\bnpm_[A-Za-z0-9]{36}\b'
targets: [files, commits, pr, comments]
severity: block
from: benchmark distractor (security)
---
No npm access token in code, commits, PRs or comments; load it from the environment (NPM_TOKEN).

## Bad
~~~~
NPM_TOKEN=npm_OwgPHmGQOuWnI9zPiDJi4kcKEDrTlYSKnVkc
~~~~

## Good
~~~~
NPM_TOKEN=${NPM_TOKEN}
~~~~
