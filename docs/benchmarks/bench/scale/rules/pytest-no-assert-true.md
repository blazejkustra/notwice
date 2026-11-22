---
kind: forbid
pattern: '^\s*assert\s+True\s*$'
targets: [files]
paths: ['test_*.py', '*_test.py', 'tests/**/*.py', 'conftest.py']
severity: block
from: benchmark distractor (testing)
---
No placeholder assert True.

## Bad
~~~~
assert True
~~~~

## Good
~~~~
assert response.status_code == 200
~~~~
