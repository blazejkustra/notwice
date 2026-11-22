---
kind: forbid
pattern: '\b(?:npm|pnpm|yarn)\s+version\s+major\b'
targets: [commands]
severity: block
from: benchmark distractor (commands)
---
Major version bumps are the maintainer's call.

## Bad
~~~~
npm version major
~~~~

## Good
~~~~
npm version patch --no-git-tag-version
~~~~
