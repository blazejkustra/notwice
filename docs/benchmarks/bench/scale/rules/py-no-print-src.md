---
kind: forbid
pattern: '^\s*print\('
targets: [files]
paths: ['src/**/*.py', 'app/**/*.py', 'lib/**/*.py']
severity: block
from: benchmark distractor (language)
---
No print() in library code; use the logging module.

## Bad
~~~~
print("loaded", user)
~~~~

## Good
~~~~
logger.info("loaded %s", user)
~~~~
