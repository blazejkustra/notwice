---
kind: forbid
pattern: 'UIApplication\.shared\.windows\b'
targets: [files]
paths: ['*.swift']
severity: block
from: benchmark distractor (language)
---
UIApplication.shared.windows is deprecated; use connected scenes.

## Bad
~~~~
let window = UIApplication.shared.windows.first
~~~~

## Good
~~~~
let window = scene.windows.first
~~~~
