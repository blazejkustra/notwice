---
kind: forbid
pattern: '^\s*(?:import\s+nose(?:\s|\.|,|$)|from\s+nose(?:\s|\.))'
targets: [files]
paths: ['*.py']
severity: block
from: benchmark distractor (dependencies)
---
Replace nose with pytest.

## Bad
~~~~
import nose
~~~~

## Good
~~~~
import pytest
~~~~
