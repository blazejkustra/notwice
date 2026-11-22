---
kind: forbid
pattern: '^\s*sudo\s'
targets: [files]
paths: ['*.{sh,bash,zsh}']
severity: block
from: benchmark distractor (language)
---
Scripts never call sudo; document the privilege instead.

## Bad
~~~~
sudo cp app /usr/local/bin
~~~~

## Good
~~~~
install -m 755 app "$HOME/.local/bin/app"
~~~~
