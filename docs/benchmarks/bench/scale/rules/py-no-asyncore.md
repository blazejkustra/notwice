---
kind: forbid
pattern: '^\s*(?:import\s+asyncore(?:\s|\.|,|$)|from\s+asyncore(?:\s|\.))'
targets: [files]
paths: ['*.py']
severity: block
from: benchmark distractor (dependencies)
---
asyncore is banned in this codebase. Use asyncio instead.

## Bad
~~~~
import asyncore
~~~~

## Good
~~~~
import asyncio
~~~~
