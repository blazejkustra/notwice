---
kind: forbid
pattern: '\.withOpacity\('
targets: [files]
paths: ['*.dart']
severity: block
from: benchmark distractor (language)
---
withOpacity is deprecated; use withValues(alpha:).

## Bad
~~~~
color.withOpacity(0.5)
~~~~

## Good
~~~~
color.withValues(alpha: 0.5)
~~~~
