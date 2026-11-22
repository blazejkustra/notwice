---
kind: forbid
pattern: '\w!!(?:\.|\s|$)'
targets: [files]
paths: ['*.{kt,kts}']
severity: block
from: benchmark distractor (language)
---
Avoid !!; handle null with ?. or requireNotNull with a message.

## Bad
~~~~
val name = user!!.name
~~~~

## Good
~~~~
val name = requireNotNull(user) { "user not loaded" }.name
~~~~
