---
kind: forbid
pattern: '^\s*(?:import\s+pkg_resources(?:\s|\.|,|$)|from\s+pkg_resources(?:\s|\.))'
targets: [files]
paths: ['*.py']
severity: block
from: benchmark distractor (dependencies)
---
pkg_resources is banned in this codebase. Use importlib.metadata or importlib.resources instead.

## Bad
~~~~
import pkg_resources
~~~~

## Good
~~~~
from importlib.metadata import version
~~~~
