---
kind: forbid
pattern: '\bpickle\.loads?\('
targets: [files]
paths: ['*.py']
severity: block
from: benchmark distractor (security)
---
Never unpickle untrusted data; use JSON.

## Bad
~~~~
data = pickle.loads(blob)
~~~~

## Good
~~~~
data = json.loads(blob)
~~~~
