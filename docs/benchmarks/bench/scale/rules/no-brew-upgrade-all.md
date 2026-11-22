---
kind: forbid
pattern: '\bbrew\s+upgrade\s*(?:$|[;&|])'
targets: [commands]
severity: block
from: benchmark distractor (commands)
---
Do not upgrade every Homebrew package from a session.

## Bad
~~~~
brew upgrade
~~~~

## Good
~~~~
brew upgrade jq
~~~~
