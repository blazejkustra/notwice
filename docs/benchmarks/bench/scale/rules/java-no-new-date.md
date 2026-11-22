---
kind: forbid
pattern: '\bnew\s+Date\(\s*\)'
targets: [files]
paths: ['*.java']
severity: block
from: benchmark distractor (language)
---
Use java.time (Instant, LocalDate) instead of new Date().

## Bad
~~~~
Date now = new Date();
~~~~

## Good
~~~~
Instant now = clock.instant();
~~~~
