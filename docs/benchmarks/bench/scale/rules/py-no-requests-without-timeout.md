---
kind: forbid
pattern: '\brequests\.(?:get|post|put|patch|delete)\((?![^)]*timeout=)[^)]*\)'
targets: [files]
paths: ['*.py']
severity: block
from: benchmark distractor (language)
---
Every requests call needs a timeout.

## Bad
~~~~
resp = requests.get(url)
~~~~

## Good
~~~~
resp = requests.get(url, timeout=10)
~~~~
