---
kind: forbid
pattern: 'fmt\.Errorf\([^)]*%v[^)]*,\s*err\)'
targets: [files]
paths: ['*.go']
severity: block
from: benchmark distractor (language)
---
Wrap errors with %w, not %v.

## Bad
~~~~
return fmt.Errorf("open config: %v", err)
~~~~

## Good
~~~~
return fmt.Errorf("open config: %w", err)
~~~~
