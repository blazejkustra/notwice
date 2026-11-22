---
kind: forbid
pattern: '\binterface\s+I[A-Z][a-z]\w*'
targets: [files]
paths: ['*.{ts,tsx,mts,cts}']
severity: block
from: benchmark distractor (naming)
---
No I prefix on interface names.

## Bad
~~~~
interface IUser { id: string }
~~~~

## Good
~~~~
interface User { id: string }
~~~~
