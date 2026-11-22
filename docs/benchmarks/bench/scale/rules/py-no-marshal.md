---
kind: forbid
pattern: '\bmarshal\.loads?\('
targets: [files]
paths: ['*.py']
severity: block
from: benchmark distractor (security)
---
Never load marshal data from outside the process.

## Bad
~~~~
obj = marshal.loads(blob)
~~~~

## Good
~~~~
obj = json.loads(blob)
~~~~
