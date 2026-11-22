---
kind: forbid
pattern: '\.printStackTrace\(\)'
targets: [files]
paths: ['*.java']
severity: block
from: benchmark distractor (language)
---
Log exceptions instead of printStackTrace().

## Bad
~~~~
e.printStackTrace();
~~~~

## Good
~~~~
log.error("Upload failed", e);
~~~~
