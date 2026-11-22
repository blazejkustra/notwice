---
kind: forbid
pattern: '\bThread\.sleep\('
targets: [files]
paths: ['*Test.kt', '*Tests.kt']
severity: block
from: benchmark distractor (testing)
---
Use runTest and advanceTimeBy instead of Thread.sleep in tests.

## Bad
~~~~
Thread.sleep(1000)
~~~~

## Good
~~~~
advanceTimeBy(1000)
~~~~
