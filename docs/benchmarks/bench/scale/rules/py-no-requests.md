---
kind: forbid
pattern: '^\s*(?:import\s+requests(?:\s|\.|,|$)|from\s+requests(?:\s|\.))'
targets: [files]
paths: ['*.py']
severity: block
from: benchmark distractor (dependencies)
---
No new code depends on requests; reach for httpx.

## Bad
~~~~
import requests
~~~~

## Good
~~~~
import httpx
~~~~
