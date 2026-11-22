---
kind: forbid
pattern: '\bUIScreen\.main\b'
targets: [files]
paths: ['*.swift']
severity: block
from: benchmark distractor (language)
---
UIScreen.main is deprecated; use the window scene screen.

## Bad
~~~~
let scale = UIScreen.main.scale
~~~~

## Good
~~~~
let scale = view.window?.windowScene?.screen.scale ?? 2
~~~~
