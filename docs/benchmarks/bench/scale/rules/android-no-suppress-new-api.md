---
kind: forbid
pattern: '@SuppressLint\(\s*"NewApi"\s*\)'
targets: [files]
paths: ['*.{kt,kts}']
severity: block
from: benchmark distractor (framework)
---
Guard API levels with a version check, never @SuppressLint("NewApi").

## Bad
~~~~
@SuppressLint("NewApi")
~~~~

## Good
~~~~
if (Build.VERSION.SDK_INT >= 33) {
~~~~
