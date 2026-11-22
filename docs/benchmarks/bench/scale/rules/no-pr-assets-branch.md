---
kind: forbid
targets: [commands]
pattern: '\bgit\s+push\b[^;&|\n]*\bpr-assets\b'
unless: '\s(--delete|-d)\s|\s:pr-assets\b'
severity: block
from: ratchet test fixture
---
Never push media to a pr-assets branch. Attach images and videos with gh pr create/edit/comment --attach <file>.

## Bad
```
git push origin pr-assets
```

## Good
```
gh pr edit 42 --attach ./before.mp4 --attach ./after.mp4
```
