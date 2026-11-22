---
kind: forbid
pattern: '^.{120,}$'
targets: [pr]
severity: block
from: benchmark distractor (git)
---
Keep PR titles and body lines under 120 characters.

## Bad
~~~~
Add a very long description of the change that keeps going well past the one hundred and twenty character limit for lines
~~~~

## Good
~~~~
Add retry to the uploader
~~~~
