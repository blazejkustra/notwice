---
kind: forbid
pattern: '^\s*print\('
targets: [files]
paths: ['Sources/**/*.swift']
severity: block
from: benchmark distractor (language)
---
Use os.Logger instead of print in app code.

## Bad
~~~~
print("Loaded \(count) items")
~~~~

## Good
~~~~
logger.info("Loaded \(count) items")
~~~~
