---
kind: forbid
pattern: '\b(?:npm|pnpm|yarn)\s+publish\b'
targets: [commands]
severity: block
from: benchmark distractor (commands)
---
Only the release workflow publishes packages.

## Bad
~~~~
npm publish --access public
~~~~

## Good
~~~~
npm pack --dry-run
~~~~
