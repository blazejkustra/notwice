---
kind: forbid
pattern: 'ALLOWED_HOSTS\s*=\s*\[\s*[''"]\*[''"]'
targets: [files]
paths: ['settings.py', '**/settings/*.py']
severity: block
from: benchmark distractor (framework)
---
Never set ALLOWED_HOSTS to ["*"].

## Bad
~~~~
ALLOWED_HOSTS = ["*"]
~~~~

## Good
~~~~
ALLOWED_HOSTS = env.list("ALLOWED_HOSTS")
~~~~
