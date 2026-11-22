---
kind: forbid
pattern: '^\s*goto\s+\w+\s*;'
targets: [files]
paths: ['*.cs']
severity: block
from: benchmark distractor (language)
---
No goto statements.

## Bad
~~~~
goto retry;
~~~~

## Good
~~~~
continue;
~~~~
