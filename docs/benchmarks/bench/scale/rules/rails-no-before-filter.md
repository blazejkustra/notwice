---
kind: forbid
pattern: '\bbefore_filter\b|\bafter_filter\b'
targets: [files]
paths: ['*.rb']
severity: block
from: benchmark distractor (framework)
---
before_filter is removed; use before_action.

## Bad
~~~~
before_filter :authenticate
~~~~

## Good
~~~~
before_action :authenticate
~~~~
