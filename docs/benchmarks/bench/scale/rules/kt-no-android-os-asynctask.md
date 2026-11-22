---
kind: forbid
pattern: '^\s*import\s+(?:static\s+)?android\.os\.AsyncTask\b'
targets: [files]
paths: ['*.{kt,kts}']
severity: block
from: benchmark distractor (dependencies)
---
android.os.AsyncTask is banned in this codebase. Use coroutines instead.

## Bad
~~~~
import android.os.AsyncTask
~~~~

## Good
~~~~
import kotlinx.coroutines.launch
~~~~
