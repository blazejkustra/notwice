---
kind: forbid
pattern: '@pytest\.mark\.xfail\s*(?:\(\s*\))?\s*$'
targets: [files]
paths: ['test_*.py', '*_test.py', 'tests/**/*.py', 'conftest.py']
severity: block
from: benchmark distractor (testing)
---
xfail needs a reason and, ideally, strict=True.

## Bad
~~~~
@pytest.mark.xfail
~~~~

## Good
~~~~
@pytest.mark.xfail(reason="upstream bug #12", strict=True)
~~~~
