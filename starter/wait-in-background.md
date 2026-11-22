---
kind: forbid
targets: [commands]
in: main
pattern: ['\bgh\s+pr\s+checks\b[^;&|\n]*\s--watch\b', '\bgh\s+run\s+watch\b']
severity: block
from: notwice starter set
---
Wait for CI in a background agent (Agent tool, run_in_background: true), never in the main session, and keep talking to the user meanwhile.

## Bad
```
gh pr checks 1853 --watch
```

## Good
```
gh pr checks 1853
```
