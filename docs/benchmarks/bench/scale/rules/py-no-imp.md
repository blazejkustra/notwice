---
kind: forbid
pattern: '^\s*(?:import\s+imp(?:\s|\.|,|$)|from\s+imp(?:\s|\.))'
targets: [files]
paths: ['*.py']
severity: block
from: benchmark distractor (dependencies)
---
imp is banned in this codebase. Use importlib instead.

## Bad
~~~~
import imp
~~~~

## Good
~~~~
import importlib
~~~~
