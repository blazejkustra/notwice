---
kind: forbid
pattern: '^\s*(?:import\s+toml(?:\s|\.|,|$)|from\s+toml(?:\s|\.))'
targets: [files]
paths: ['*.py']
severity: block
from: benchmark distractor (dependencies)
---
toml is banned in this codebase. Use tomllib instead.

## Bad
~~~~
import toml
~~~~

## Good
~~~~
import tomllib
~~~~
