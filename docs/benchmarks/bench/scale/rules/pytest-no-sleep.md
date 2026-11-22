---
kind: forbid
pattern: '\btime\.sleep\('
targets: [files]
paths: ['test_*.py', '*_test.py', 'tests/**/*.py', 'conftest.py']
severity: block
from: benchmark distractor (testing)
---
No time.sleep in tests; freeze or advance time.

## Bad
~~~~
time.sleep(2)
~~~~

## Good
~~~~
freezer.tick(2)
~~~~
