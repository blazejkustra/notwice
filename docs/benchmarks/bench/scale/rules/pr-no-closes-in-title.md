---
kind: forbid
pattern: '^(?:Closes|Fixes|Resolves) #\d+\s*$'
targets: [pr]
severity: block
from: benchmark distractor (git)
---
PR titles describe the change; put "Fixes #123" in the body.

## Bad
~~~~
Fixes #42
~~~~

## Good
~~~~
Handle empty carts in checkout
~~~~
