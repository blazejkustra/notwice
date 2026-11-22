---
kind: forbid
pattern: '^##\s+(?!(Problem|Approach|Scope|Tests|Screenshots)\s*$)'
targets: [pr]
severity: block
from: ratchet test fixture
---
PR bodies have no sections beyond Problem, Approach, Scope, Tests and Screenshots. Put decisions for the user in chat.

## Bad
```
## Before merging
- [ ] Decide whether to publish to npm
```

## Good
```
## Tests
- npm test passes; publishing to npm was not tried
```
