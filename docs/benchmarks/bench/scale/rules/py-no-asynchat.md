---
kind: forbid
pattern: '^\s*(?:import\s+asynchat(?:\s|\.|,|$)|from\s+asynchat(?:\s|\.))'
targets: [files]
paths: ['*.py']
severity: block
from: benchmark distractor (dependencies)
---
Replace asynchat with asyncio.

## Bad
~~~~
import asynchat
~~~~

## Good
~~~~
import asyncio
~~~~
