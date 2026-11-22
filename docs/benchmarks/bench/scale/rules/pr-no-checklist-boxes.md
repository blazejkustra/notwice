---
kind: forbid
pattern: '^\s*-\s*\[\s\]\s'
targets: [pr]
severity: block
from: benchmark distractor (git)
---
No unchecked task boxes in PR bodies; finish the work or leave it out.

## Bad
~~~~
- [ ] Update docs
~~~~

## Good
~~~~
- Docs updated in README
~~~~
