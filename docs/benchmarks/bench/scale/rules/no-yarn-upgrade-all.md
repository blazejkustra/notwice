---
kind: forbid
pattern: '\byarn\s+upgrade\s*(?:$|[;&|])|\bpnpm\s+(?:up|update)\s+--latest\s*(?:$|[;&|])'
targets: [commands]
severity: block
from: benchmark distractor (commands)
---
Upgrade dependencies one at a time, never all at once.

## Bad
~~~~
yarn upgrade
~~~~

## Good
~~~~
yarn upgrade react@19.2.0
~~~~
