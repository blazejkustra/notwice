---
kind: forbid
pattern: '@pytest\.mark\.skip\s*(?:\(\s*\))?\s*$'
targets: [files]
paths: ['test_*.py', '*_test.py', 'tests/**/*.py', 'conftest.py']
severity: block
from: benchmark distractor (testing)
---
pytest skips need reason=.

## Bad
~~~~
@pytest.mark.skip
~~~~

## Good
~~~~
@pytest.mark.skip(reason="needs GPU")
~~~~
