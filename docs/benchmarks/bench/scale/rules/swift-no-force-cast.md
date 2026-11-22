---
kind: forbid
pattern: '\bas!\s'
targets: [files]
paths: ['*.swift']
severity: block
from: benchmark distractor (language)
---
No force casts (as!); use as? and handle failure.

## Bad
~~~~
let cell = view as! UserCell
~~~~

## Good
~~~~
guard let cell = view as? UserCell else { return }
~~~~
