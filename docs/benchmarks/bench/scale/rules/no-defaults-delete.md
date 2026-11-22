---
kind: forbid
pattern: '\bdefaults\s+delete\b'
targets: [commands]
severity: block
from: benchmark distractor (commands)
---
Do not delete macOS defaults domains.

## Bad
~~~~
defaults delete com.apple.dock
~~~~

## Good
~~~~
defaults read com.apple.dock
~~~~
