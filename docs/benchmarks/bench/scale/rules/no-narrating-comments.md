---
kind: forbid
pattern: '(^|\s)(//|#|/?\*|<!--)\s*(moved (here )?from|was previously|previously (this|we|it)|no longer (needed|used)|changed (this|from|to)|renamed from|now (uses|we)|we now|updated to|this (change|fix|PR) )'
flags: i
targets: [files]
paths: ['*.js', '*.mjs', '*.cjs', '*.ts', '*.tsx', '*.jsx', '*.py', '*.rb', '*.go', '*.rs', '*.swift', '*.kt', '*.java', '*.sh']
severity: warn
from: ratchet test fixture
---
No comments that narrate a change ("moved from X", "was previously Y"). Put that in the commit message.

## Bad
```
  // Moved from auto-capture.ts so the server can reuse it
```

## Good
```
  // Only valid after the tool server has started
```
