---
kind: forbid
pattern: '\.ToLower(?:Invariant)?\(\)\s*=='
targets: [files]
paths: ['*.cs']
severity: block
from: benchmark distractor (language)
---
Use string.Equals with StringComparison.OrdinalIgnoreCase.

## Bad
~~~~
if (role.ToLower() == "admin")
~~~~

## Good
~~~~
if (string.Equals(role, "admin", StringComparison.OrdinalIgnoreCase))
~~~~
