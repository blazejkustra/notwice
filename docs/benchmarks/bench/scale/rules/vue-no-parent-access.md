---
kind: forbid
pattern: 'this\.\$(?:parent|root)\b'
targets: [files]
paths: ['*.vue']
severity: block
from: benchmark distractor (framework)
---
Do not reach into $parent or $root; use props and emits.

## Bad
~~~~
this.$parent.refresh()
~~~~

## Good
~~~~
emit("refresh")
~~~~
