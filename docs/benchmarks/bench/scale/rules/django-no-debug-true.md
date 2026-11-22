---
kind: forbid
pattern: '^\s*DEBUG\s*=\s*True\b'
targets: [files]
paths: ['settings.py', '**/settings/*.py']
severity: block
from: benchmark distractor (framework)
---
DEBUG must come from the environment, never True in settings.

## Bad
~~~~
DEBUG = True
~~~~

## Good
~~~~
DEBUG = env.bool("DEBUG", default=False)
~~~~
