---
kind: forbid
pattern: '\bThread\.sleep\('
targets: [files]
paths: ['*.{kt,kts}']
severity: block
from: benchmark distractor (language)
---
Use delay() in coroutines instead of Thread.sleep.

## Bad
~~~~
Thread.sleep(500)
~~~~

## Good
~~~~
delay(500)
~~~~
