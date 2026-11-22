---
kind: forbid
pattern: '\bdatetime\.now\(\s*\)'
targets: [files]
paths: ['*.py']
severity: block
from: benchmark distractor (language)
---
Always pass a timezone to datetime.now().

## Bad
~~~~
created = datetime.now()
~~~~

## Good
~~~~
created = datetime.now(timezone.utc)
~~~~
