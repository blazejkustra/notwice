---
kind: forbid
pattern: '^\s*print\('
targets: [files]
paths: ['test_*.py', '*_test.py', 'tests/**/*.py', 'conftest.py']
severity: block
from: benchmark distractor (testing)
---
No print in tests; assert or use caplog.

## Bad
~~~~
print(response.json())
~~~~

## Good
~~~~
assert response.json() == expected
~~~~
