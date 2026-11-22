---
kind: forbid
pattern: '^(?:Resolved|Closed|Fixed) (?:issue|ticket|bug) #?\d+'
targets: [commits]
severity: block
from: benchmark distractor (git)
---
Reference issues with "Fixes #123" in the body, not a past-tense subject.

## Bad
~~~~
Fixed issue #42
~~~~

## Good
~~~~
Handle empty carts in checkout
~~~~
