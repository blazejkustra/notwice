---
kind: forbid
pattern: '^\s*(?:import\s+urllib2(?:\s|\.|,|$)|from\s+urllib2(?:\s|\.))'
targets: [files]
paths: ['*.py']
severity: block
from: benchmark distractor (dependencies)
---
urllib2 is banned in this codebase. Use urllib.request or httpx instead.

## Bad
~~~~
import urllib2
~~~~

## Good
~~~~
import httpx
~~~~
