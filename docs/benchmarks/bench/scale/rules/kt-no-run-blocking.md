---
kind: forbid
pattern: '\brunBlocking\s*[{(]'
targets: [files]
paths: ['src/main/**/*.kt']
severity: block
from: benchmark distractor (language)
---
No runBlocking in production code.

## Bad
~~~~
val user = runBlocking { api.user(id) }
~~~~

## Good
~~~~
val user = api.user(id)
~~~~
