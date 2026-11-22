---
kind: forbid
pattern: 'UserDefaults\.standard\.synchronize\(\)'
targets: [files]
paths: ['*.swift']
severity: block
from: benchmark distractor (language)
---
UserDefaults.synchronize() is unnecessary; remove it.

## Bad
~~~~
UserDefaults.standard.synchronize()
~~~~

## Good
~~~~
UserDefaults.standard.set(true, forKey: "seen")
~~~~
