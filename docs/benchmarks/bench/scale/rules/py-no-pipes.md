---
kind: forbid
pattern: '^\s*(?:import\s+pipes(?:\s|\.|,|$)|from\s+pipes(?:\s|\.))'
targets: [files]
paths: ['*.py']
severity: block
from: benchmark distractor (dependencies)
---
Replace pipes with shlex.

## Bad
~~~~
import pipes
~~~~

## Good
~~~~
import shlex
~~~~
