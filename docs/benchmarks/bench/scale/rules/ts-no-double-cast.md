---
kind: forbid
pattern: '\bas\s+unknown\s+as\b'
targets: [files]
paths: ['*.{ts,tsx,mts,cts}']
severity: block
from: benchmark distractor (language)
---
No double casts through unknown; fix the types.

## Bad
~~~~
const user = data as unknown as User
~~~~

## Good
~~~~
const user = UserSchema.parse(data)
~~~~
