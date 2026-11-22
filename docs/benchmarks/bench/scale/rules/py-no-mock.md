---
kind: forbid
pattern: '^\s*(?:import\s+mock(?:\s|\.|,|$)|from\s+mock(?:\s|\.))'
targets: [files]
paths: ['*.py']
severity: block
from: benchmark distractor (dependencies)
---
mock is banned in this codebase. Use unittest.mock instead.

## Bad
~~~~
import mock
~~~~

## Good
~~~~
from unittest import mock
~~~~
