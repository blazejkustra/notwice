---
kind: forbid
pattern: '^\s*(?:import\s+pytz(?:\s|\.|,|$)|from\s+pytz(?:\s|\.))'
targets: [files]
paths: ['*.py']
severity: block
from: benchmark distractor (dependencies)
---
Replace pytz with zoneinfo.

## Bad
~~~~
import pytz
~~~~

## Good
~~~~
from zoneinfo import ZoneInfo
~~~~
