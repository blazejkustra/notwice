---
kind: forbid
pattern: '\bgit\s+submodule\s+deinit\b'
targets: [commands]
severity: block
from: benchmark distractor (commands)
---
Ask before removing submodules.

## Bad
~~~~
git submodule deinit -f vendor/lib
~~~~

## Good
~~~~
git submodule status
~~~~
