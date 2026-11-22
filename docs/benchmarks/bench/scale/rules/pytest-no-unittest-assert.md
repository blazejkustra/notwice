---
kind: forbid
pattern: 'self\.assert(?:Equal|True|False|In|IsNone)\('
targets: [files]
paths: ['test_*.py', '*_test.py', 'tests/**/*.py', 'conftest.py']
severity: block
from: benchmark distractor (testing)
---
Use plain assert in pytest, not unittest assert methods.

## Bad
~~~~
self.assertEqual(total, 3)
~~~~

## Good
~~~~
assert total == 3
~~~~
