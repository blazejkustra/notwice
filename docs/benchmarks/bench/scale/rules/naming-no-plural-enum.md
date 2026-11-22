---
kind: forbid
pattern: '\b(?:enum|type)\s+\w+(?:Types|Statuses|Kinds)\b'
targets: [files]
paths: ['*.{ts,tsx,mts,cts}']
severity: block
from: benchmark distractor (naming)
---
Type and enum names are singular.

## Bad
~~~~
type OrderStatuses = "open" | "closed"
~~~~

## Good
~~~~
type OrderStatus = "open" | "closed"
~~~~
