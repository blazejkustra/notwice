---
kind: forbid
pattern: '^\s*(?:import\s+six(?:\s|\.|,|$)|from\s+six(?:\s|\.))'
targets: [files]
paths: ['*.py']
severity: block
from: benchmark distractor (dependencies)
---
No new code depends on six; reach for native Python 3 code.

## Bad
~~~~
import six
~~~~

## Good
~~~~
from collections.abc import Mapping
~~~~
