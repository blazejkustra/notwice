---
kind: forbid
pattern: '\w!\.\w+!\.'
targets: [files]
paths: ['*.{ts,tsx,mts,cts}']
severity: block
from: benchmark distractor (language)
---
Do not chain non-null assertions; narrow the type once.

## Bad
~~~~
const name = user!.profile!.name
~~~~

## Good
~~~~
const name = user?.profile?.name ?? ""
~~~~
