---
kind: forbid
pattern: '\bdatetime\.utcnow\(\)'
targets: [files]
paths: ['*.py']
severity: block
from: benchmark distractor (language)
---
datetime.utcnow() is deprecated; use datetime.now(timezone.utc).

## Bad
~~~~
stamp = datetime.utcnow()
~~~~

## Good
~~~~
stamp = datetime.now(timezone.utc)
~~~~
