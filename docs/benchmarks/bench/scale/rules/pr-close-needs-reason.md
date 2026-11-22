---
kind: forbid
targets: [commands]
pattern: '\bgh\s+pr\s+close\b'
unless: '\s(--comment|-c)[\s=]+\S'
severity: block
from: ratchet test fixture
---
Close a PR only with a reason: gh pr close <n> --comment "<why, and what replaces it>".

## Bad
```
gh pr close 359 && gh pr view 359 --json state -q .state
```

## Good
```
gh pr close 1408 --comment "Superseded by #1410, which keeps the retry loop"
```
