---
kind: forbid
pattern: '\bgit\s+config\s+--global\b'
targets: [commands]
severity: block
from: benchmark distractor (commands)
---
Do not change the global git config from a session.

## Bad
~~~~
git config --global user.email bot@example.com
~~~~

## Good
~~~~
git config user.email bot@example.com
~~~~
