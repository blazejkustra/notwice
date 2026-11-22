---
kind: forbid
pattern: '(?:^|[;&|]\s*)sudo\s'
targets: [commands]
severity: block
from: benchmark distractor (commands)
---
Never run sudo from an agent session; ask the user.

## Bad
~~~~
sudo npm install -g pnpm
~~~~

## Good
~~~~
corepack enable
~~~~
