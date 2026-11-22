---
kind: forbid
pattern: '^\s*(?:import\s+dateutil\.parser(?:\s|\.|,|$)|from\s+dateutil\.parser(?:\s|\.))'
targets: [files]
paths: ['*.py']
severity: block
from: benchmark distractor (dependencies)
---
dateutil.parser is banned in this codebase. Use datetime.fromisoformat instead.

## Bad
~~~~
import dateutil.parser
~~~~

## Good
~~~~
from datetime import datetime
~~~~
