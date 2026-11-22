---
kind: forbid
pattern: '(?<![\w$)\]])\(\s*async\s*(\(\s*\)\s*=>|function\b)'
targets: [files]
paths: ['*.js', '*.mjs', '*.cjs', '*.ts', '*.tsx', '*.jsx']
severity: warn
from: notwice test fixture
---
No inline async IIFEs. Extract a small named async function and call it.

## Bad
```
void (async () => { await refreshScreenshot(device) })()
```

## Good
```
void refreshScreenshot(device)
```
