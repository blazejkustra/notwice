---
kind: forbid
pattern: '^\s*default_scope\b'
targets: [files]
paths: ['*.rb']
severity: block
from: benchmark distractor (framework)
---
Do not use default_scope; use named scopes.

## Bad
~~~~
default_scope { where(active: true) }
~~~~

## Good
~~~~
scope :active, -> { where(active: true) }
~~~~
