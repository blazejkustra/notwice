---
kind: forbid
targets: [files]
in: main
pattern: '\S'
paths: ['*.ts']
severity: block
from: test fixture
---
This session orchestrates: hand code changes to a subagent.

## Bad
```
export const a = 1
```

## Good
```

```
