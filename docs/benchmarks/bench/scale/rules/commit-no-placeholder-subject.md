---
kind: forbid
pattern: '^(?:asdf|test|tmp|temp|update|fix|changes|stuff|misc)\s*$'
flags: i
targets: [commits]
severity: block
from: benchmark distractor (git)
---
Write a commit subject that says what changed.

## Bad
~~~~
fix
~~~~

## Good
~~~~
Fix the off-by-one in pagination
~~~~
