---
kind: forbid
pattern: '\bstartActivityForResult\('
targets: [files]
paths: ['*.{kt,kts}']
severity: block
from: benchmark distractor (framework)
---
Use the Activity Result API instead of startActivityForResult.

## Bad
~~~~
startActivityForResult(intent, REQUEST_PICK)
~~~~

## Good
~~~~
pickLauncher.launch(intent)
~~~~
