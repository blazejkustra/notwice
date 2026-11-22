---
kind: forbid
pattern: '^\s*(?:import\s+simplejson(?:\s|\.|,|$)|from\s+simplejson(?:\s|\.))'
targets: [files]
paths: ['*.py']
severity: block
from: benchmark distractor (dependencies)
---
simplejson is banned in this codebase. Use json instead.

## Bad
~~~~
import simplejson
~~~~

## Good
~~~~
import json
~~~~
