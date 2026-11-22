---
kind: forbid
pattern: '\bnew\s+SimpleDateFormat\('
targets: [files]
paths: ['*.java']
severity: block
from: benchmark distractor (language)
---
SimpleDateFormat is not thread-safe; use DateTimeFormatter.

## Bad
~~~~
new SimpleDateFormat("yyyy-MM-dd")
~~~~

## Good
~~~~
DateTimeFormatter.ISO_LOCAL_DATE
~~~~
