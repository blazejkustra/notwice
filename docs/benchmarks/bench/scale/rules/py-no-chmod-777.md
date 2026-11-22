---
kind: forbid
pattern: '\bos\.chmod\([^)]*0o?777'
targets: [files]
paths: ['*.py']
severity: block
from: benchmark distractor (security)
---
Never make files world-writable.

## Bad
~~~~
os.chmod(path, 0o777)
~~~~

## Good
~~~~
os.chmod(path, 0o640)
~~~~
