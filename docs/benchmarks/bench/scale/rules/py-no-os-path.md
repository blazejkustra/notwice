---
kind: forbid
pattern: '\bos\.path\.(?:join|exists|dirname|basename)\('
targets: [files]
paths: ['*.py']
severity: warn
from: benchmark distractor (language)
---
Use pathlib instead of os.path.

## Bad
~~~~
path = os.path.join(root, "data")
~~~~

## Good
~~~~
path = root / "data"
~~~~
