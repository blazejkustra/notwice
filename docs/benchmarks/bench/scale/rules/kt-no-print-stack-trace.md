---
kind: forbid
pattern: '\.printStackTrace\(\)'
targets: [files]
paths: ['*.{kt,kts}']
severity: block
from: benchmark distractor (language)
---
Log errors instead of printStackTrace().

## Bad
~~~~
e.printStackTrace()
~~~~

## Good
~~~~
logger.error(e) { "upload failed" }
~~~~
