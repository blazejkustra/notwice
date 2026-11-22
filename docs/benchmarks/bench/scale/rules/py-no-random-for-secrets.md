---
kind: forbid
pattern: '\brandom\.(?:random|randint|choice|getrandbits)\('
targets: [files]
paths: ['**/auth/**/*.py', '**/security/**/*.py', '**/tokens.py']
severity: block
from: benchmark distractor (security)
---
Use the secrets module for tokens and passwords, not random.

## Bad
~~~~
token = random.getrandbits(128)
~~~~

## Good
~~~~
token = secrets.token_hex(16)
~~~~
