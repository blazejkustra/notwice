---
kind: forbid
pattern: '(?<![\w.])exec\('
targets: [files]
paths: ['*.py']
severity: block
from: benchmark distractor (security)
---
Never use exec().

## Bad
~~~~
exec(code)
~~~~

## Good
~~~~
handlers[name](payload)
~~~~
